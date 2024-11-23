import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import { OpenAIChatMessageContent } from '../../chatCompletion';
import { OpenAIStreamingChatMessageContent } from '../../chatCompletion/OpenAIStreamingChatMessageContent';
import { OpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { OpenAIFunctionToolCall } from '../OpenAIFunctionToolCall';
import { createChatCompletionCreateParams } from './chatCompletionParams';
import {
  ChatHistory,
  FunctionCallContent,
  FunctionCallsProcessor,
  FunctionName,
  Kernel,
  KernelArguments,
  StreamingFunctionCallUpdateContent,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export type OpenAIChatCompletionParams = {
  modelId: string;
  chatHistory: ChatHistory;
  executionSettings?: OpenAIPromptExecutionSettings;
  kernel?: Kernel;
};

export class OpenAIChatCompletion {
  private readonly openAIClient: OpenAI;
  private readonly functionCallsProcessor: FunctionCallsProcessor;

  public constructor(openAIClient: OpenAI) {
    this.openAIClient = openAIClient;
    this.functionCallsProcessor = new FunctionCallsProcessor();
  }

  public getChatMessageContent = async ({
    modelId,
    chatHistory,
    executionSettings,
    kernel,
  }: OpenAIChatCompletionParams) => {
    for (let requestIndex = 1; ; requestIndex++) {
      // TODO record completion activity
      const functionCallingConfig = executionSettings?.functionChoiceBehavior?.getConfiguredOptions({
        requestSequenceIndex: requestIndex,
        chatHistory,
        kernel,
      });

      const chatCompletionCreateParams = createChatCompletionCreateParams(
        modelId,
        chatHistory,
        executionSettings,
        functionCallingConfig
      );
      const chatCompletion = await this.openAIClient.chat.completions.create(chatCompletionCreateParams);
      const functionCallContents = this.getFunctionCallContents(chatCompletion.choices[0].message.tool_calls);
      const chatMessageContent = OpenAIChatMessageContent.fromOpenAIChatCompletion({
        chatCompletion,
        modelId,
        items: functionCallContents,
      });

      // If we don't want to attempt to invoke any functions, just return the result.
      if (!functionCallingConfig?.autoInvoke) {
        return [chatMessageContent];
      }

      // Get our single result and extract the function call information. If this isn't a function call, or if it is
      // but we're unable to find the function or extract the relevant information, just return the single result.
      // Note that we don't check the FinishReason and instead check whether there are any tool calls, as the service
      // may return a FinishReason of "stop" even if there are tool calls to be made, in particular if a required tool
      // is specified.
      if (!chatCompletion.choices[0].message.tool_calls) {
        return [chatMessageContent];
      }

      await this.functionCallsProcessor.ProcessFunctionCalls({
        chatMessageContent,
        chatHistory,
        requestIndex,
        checkIfFunctionAdvertised: (functionCallContent) =>
          OpenAIChatCompletion.isRequestableTool(functionCallContent, chatCompletionCreateParams.tools),
        kernel,
      });
    }
  };

  public async *getChatMessageContentStream({
    modelId,
    chatHistory,
    executionSettings,
    kernel,
  }: OpenAIChatCompletionParams) {
    const contentBuilder: string[] = [];
    const toolCallIdsByIndex = new Map<number, string>();
    const functionNamesByIndex = new Map<number, string>();
    const functionArgumentByIndex = new Map<number, string>();

    for (let requestIndex = 1; ; requestIndex++) {
      // Assume the role is assistant by default and update it if the completion specifies a different role.
      let streamedRole: OpenAI.ChatCompletionChunk.Choice.Delta['role'] = 'assistant';
      const streamedContent: string[] = [];

      // TODO record completion activity
      const functionCallingConfig = executionSettings?.functionChoiceBehavior?.getConfiguredOptions({
        requestSequenceIndex: requestIndex,
        chatHistory,
        kernel,
      });

      const chatCompletionCreateParams = createChatCompletionCreateParams(
        modelId,
        chatHistory,
        executionSettings,
        functionCallingConfig
      );

      const chatCompletionChunks = await this.openAIClient.chat.completions.create({
        ...chatCompletionCreateParams,
        stream: true,
      });

      for await (const chatCompletionChunk of chatCompletionChunks) {
        const choice = chatCompletionChunk.choices[0];

        if (choice.delta.role) {
          streamedRole = choice.delta.role;
        }

        if (choice.delta.content) {
          streamedContent.push(choice.delta.content);
        }

        if (functionCallingConfig?.autoInvoke) {
          OpenAIFunctionToolCall.TrackStreamingToolUpdate({
            updates: chatCompletionChunk.choices[0].delta?.tool_calls,
            toolCallIdsByIndex,
            functionNamesByIndex,
            functionArgumentByIndex,
          });
        }

        const openAIStreamingChatMessageContent = OpenAIStreamingChatMessageContent.fromOpenAIChatCompletionChunk({
          chatCompletionChunk,
          modelId,
          role: streamedRole,
          items: [],
        });

        for (const toolCall of chatCompletionChunk.choices[0].delta?.tool_calls ?? []) {
          if (!toolCall.id || !toolCall.function?.name || !toolCall.function?.arguments) {
            continue;
          }

          const streamingFunctionCallUpdateContent = new StreamingFunctionCallUpdateContent({
            callId: toolCall.id,
            name: toolCall.function.name,
            arguments: toolCall.function.arguments,
            functionCallIndex: toolCall.index,
          });

          (openAIStreamingChatMessageContent as OpenAIStreamingChatMessageContent<'assistant'>).items.push(
            streamingFunctionCallUpdateContent
          );
        }

        contentBuilder.push(choice.delta.content ?? '');
        yield openAIStreamingChatMessageContent;
      }

      const toolCalls = OpenAIFunctionToolCall.ConvertToolCallUpdatesToFunctionToolCalls({
        toolCallIdsByIndex,
        functionNamesByIndex,
        functionArgumentByIndex,
      });

      const functionCallContents = this.getFunctionCallContents(toolCalls);

      if (!functionCallingConfig?.autoInvoke || toolCallIdsByIndex.size === 0) {
        return;
      }

      const content = streamedContent.join('');
      const chatMessageContent = new OpenAIChatMessageContent<typeof streamedRole>({
        role: streamedRole,
        modelId,
        content,
        items: functionCallContents,
      });

      await this.functionCallsProcessor.ProcessFunctionCalls({
        chatMessageContent,
        chatHistory,
        requestIndex,
        checkIfFunctionAdvertised: (functionCallContent) =>
          OpenAIChatCompletion.isRequestableTool(functionCallContent, chatCompletionCreateParams.tools),
        kernel,
      });
    }
  }

  private getFunctionCallContents(toolCalls?: Array<OpenAI.ChatCompletionMessageToolCall>) {
    const items: Array<FunctionCallContent> = [];

    if (toolCalls) {
      for (const toolCall of toolCalls) {
        // Only process function calls
        if (toolCall.type !== 'function') {
          continue;
        }

        const functionArguments = JSON.parse(toolCall.function.arguments);
        const { functionName, pluginName } = FunctionName.parse(toolCall.function.name, OpenAIFunctionNameSeparator);

        items.push(
          new FunctionCallContent({
            id: toolCall.id,
            functionName,
            pluginName,
            arguments: new KernelArguments({ arguments: functionArguments }),
          })
        );
      }
    }

    return items;
  }

  /**
   * Checks if a tool call is for a function that was defined.
   */
  private static isRequestableTool(functionCallContent: FunctionCallContent, tools?: OpenAI.ChatCompletionTool[]) {
    if (!tools) {
      return false;
    }

    for (const tool of tools) {
      if (tool.type !== 'function') {
        continue;
      }

      if (
        tool.function.name ===
        FunctionName.fullyQualifiedName({
          functionName: functionCallContent.functionName,
          pluginName: functionCallContent.pluginName,
          nameSeparator: OpenAIFunctionNameSeparator,
        })
      ) {
        return true;
      }
    }

    return false;
  }
}
