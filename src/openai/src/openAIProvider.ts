import { OpenAIChatMessageContent, createOpenAIChatMessageContent, getOpenAIChatMessageContentToolCalls } from './chatCompletion/OpenAIChatMessageContent';
import { OpenAIPromptExecutionSettings, getOpenAIPromptExecutionSettings } from './openAIPromptExecutionSettings';
import { ChatHistory, ChatMessageContent, Kernel, TextContent, fullyQualifiedName, systemChatMessage, toolChatMessage } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';
import { ChatCompletionContentPartText, ChatCompletionCreateParamsNonStreaming, ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources/chat/completions';


export interface OpenAIProvider {
  attributes: ReadonlyMap<string, string | number | null>;
  completion(completionParams: OpenAIChatCompletionParams): Promise<Array<ChatMessageContent>>;
}

export type OpenAIProviderParams = {
  apiKey: string;
  organization?: string;
  openAIClient?: OpenAI;
};

export type OpenAIChatCompletionParams = {
  model: string;
  chatHistory: ChatHistory;
  executionSettings?: OpenAIPromptExecutionSettings;
  kernel?: Kernel;
};

export const createOpenAI = ({ apiKey, organization, openAIClient }: OpenAIProviderParams): OpenAIProvider => {
  openAIClient =
    openAIClient ??
    new OpenAI({
      apiKey,
      organization,
      dangerouslyAllowBrowser: true
    });

  const getToolCallingConfig = (
    requestIndex: number,
    kernel?: Kernel,
    executionSettings?: OpenAIPromptExecutionSettings
  ): {
    tools: ChatCompletionTool[] | undefined;
    choice: ChatCompletionToolChoiceOption | undefined;
    autoInvoke: boolean;
  } => {
    if (!executionSettings || !executionSettings.toolCallBehavior) {
      return {
        tools: undefined,
        choice: undefined,
        autoInvoke: false,
      };
    }

    if (requestIndex >= executionSettings.toolCallBehavior.MaximumUseAttempts) {
      return {
        tools: [],
        choice: 'none',
        autoInvoke: false,
      };
    }

    const { tools, choice } = executionSettings.toolCallBehavior.configureOptions(kernel);

    const autoInvoke = kernel !== undefined && executionSettings.toolCallBehavior.MaximumAutoInvokeAttempts > 0;

    return {
      tools: tools ?? [],
      choice: choice ?? 'none',
      autoInvoke,
    };
  };

  const createChatCompletionMessages = (message: ChatMessageContent): OpenAI.Chat.ChatCompletionMessageParam[] => {
    if (message.role === 'system') {
      const chatSystemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
        role: 'system',
        name: message.authorName,
        content: message.items.text,
      };

      return [chatSystemMessage];
    }

    if (message.role === 'tool') {
      const toolCallId = (message.metadata ?? {})['tool_call_id'];

      if (!toolCallId || typeof toolCallId !== 'string') {
        throw new Error('Tool call ID is required for tool messages and must be a string.');
      }

      const chatToolMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
        role: 'tool',
        content: message.items.text,
        tool_call_id: toolCallId,
      };

      return [chatToolMessage];
    }

    if (message.role === 'user') {
      if (message.items.length === 1 && message.items[0].type === 'text') {
        const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
          role: 'user',
          content: message.items[0].text,
        };

        return [chatUserMessage];
      }

      for (const item of message.items) {
        if (item.type === 'text') {
          const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
            role: 'user',
            content: item.text,
          };

          return [chatUserMessage];
        } else if (item.type === 'image') {
          // TODO
        } else {
          throw new Error(`Unsupported chat item type: ${item.type}`);
        }
      }
    }

    if (message.role === 'assistant') {
      const messageToolCalls = getOpenAIChatMessageContentToolCalls(message);
      const chatAssistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        name: message.authorName,
      };

      // TODO: fix this TextContent type check
      if (message.items.length === 1) {
        if ('type' in message.items[0] && (message.items[0] as TextContent).type === 'text') {
          chatAssistantMessage.content = (message.items[0] as TextContent).text;
        }
      } else {
        chatAssistantMessage.content = message.items
          .map((item) => {
            if ('type' in item && (item as TextContent).type === 'text') {
              return {
                type: 'text',
                text: item.text,
              };
            }
          })
          .filter((item) => item) as ChatCompletionContentPartText[];
      }

      if (messageToolCalls.length > 0) {
        chatAssistantMessage.tool_calls = messageToolCalls.map((toolCall) => {
          if (!toolCall.id) {
            throw new Error(`ToolCall.Id is not defined for ${toolCall.functionName} in plugin ${toolCall.pluginName}`);
          }

          return {
            type: 'function',
            function: {
              name: fullyQualifiedName({
                functionName: toolCall.functionName,
                pluginName: toolCall.pluginName,
              }),
              arguments: JSON.stringify(toolCall.arguments),
            },
            id: toolCall.id,
          };
        });
      }

      return [chatAssistantMessage];
    }

    throw new Error(`Unsupported chat message role: ${message.role}`);
  };

  const createChatCompletionCreateParams = (
    model: string,
    chatHistory: ChatHistory,
    promptExecutionSettings?: OpenAIPromptExecutionSettings,
    toolCallingConfig?: ReturnType<typeof getToolCallingConfig>
  ): ChatCompletionCreateParamsNonStreaming => {
    const executionSettings = getOpenAIPromptExecutionSettings(promptExecutionSettings);
    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    let tools: ChatCompletionTool[] | undefined;
    let toolChoice: ChatCompletionToolChoiceOption | undefined;

    // Add the system prompt if provided first
    if (executionSettings.chatSystemPrompt && !chatHistory.find((message) => message.role === 'system')) {
      messages = [...messages, ...createChatCompletionMessages(systemChatMessage(executionSettings.chatSystemPrompt))];
    }

    for (const chatMessage of chatHistory) {
      messages = [...messages, ...createChatCompletionMessages(chatMessage)];
    }

    if (toolCallingConfig) {
      tools = toolCallingConfig.tools;
      toolChoice = toolCallingConfig.choice;
    }

    return {
      model,
      temperature: executionSettings.temperature,
      top_p: executionSettings.topP,
      messages,
      tools,
      tool_choice: toolChoice,
    };
  };

  const completion = async ({ model, chatHistory, executionSettings, kernel }: OpenAIChatCompletionParams) => {
    for (let requestIndex = 1; ; requestIndex++) {
      // TODO record completion activity
      const toolCallingConfig = getToolCallingConfig(requestIndex, kernel, executionSettings);
      const chatCompletionCreateParams = createChatCompletionCreateParams(
        model,
        chatHistory,
        executionSettings,
        toolCallingConfig
      );
      const chatCompletion = await openAIClient.chat.completions.create(chatCompletionCreateParams);
      const chatMessageContent: OpenAIChatMessageContent = createOpenAIChatMessageContent(chatCompletion, model);

      // If we don't want to attempt to invoke any functions, just return the result.
      if (!toolCallingConfig.autoInvoke) {
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

      // Add the result message to the caller's chat history;
      // this is required for the service to understand the tool call responses.
      chatHistory.push(chatMessageContent);

      const toolCalls = getOpenAIChatMessageContentToolCalls(chatMessageContent);
      for (let toolCallIndex = 0; toolCallIndex < toolCalls.length; toolCallIndex++) {
        const toolCall = toolCalls[toolCallIndex];

        const kernelFunction = kernel?.plugins.getFunction(toolCall.functionName, toolCall.pluginName);

        if (!kernelFunction) {
          // TODO: should we add this to ChatHistory instead of throwing? Similar for other use-cases.
          throw new Error(`Unable to find function "${toolCall.functionName}" in plugin "${toolCall.pluginName}".`);
        }

        const functionResult = await kernel?.invoke(kernelFunction, toolCall.arguments);

        if (!functionResult || !functionResult.value) {
          throw new Error(
            `Function "${toolCall.functionName}" in plugin "${toolCall.pluginName}" returned null result.`
          );
        }

        // TODO: improve this to process the FunctionResult better
        // (e.g. consider ChatContent return type, etc.)
        chatHistory.push(
          toolChatMessage(String(functionResult.value), {
            tool_call_id: toolCall.id,
          })
        );
      }
    }
  };

  return {
    attributes: new Map(),
    completion,
  };
};
