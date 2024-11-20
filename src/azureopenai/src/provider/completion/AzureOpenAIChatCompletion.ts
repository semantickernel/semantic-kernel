import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import { AzureOpenAIPromptExecutionSettings } from '../../azureOpenAIPromptExecutionSettings';
import { AzureOpenAIChatMessageContent } from '../../chatCompletion';
import { createChatCompletionCreateParams } from './chatCompletionParams';
import {
  ChatHistory,
  FunctionCallContent,
  FunctionCallsProcessor,
  FunctionName,
  Kernel,
} from '@semantic-kernel/abstractions';
import OpenAI, { AzureOpenAI } from 'openai';

export type OpenAIChatCompletionParams = {
  model: string;
  chatHistory: ChatHistory;
  executionSettings?: AzureOpenAIPromptExecutionSettings;
  kernel?: Kernel;
};

export class AzureOpenAIChatCompletion {
  private readonly azureOpenAIClient: AzureOpenAI;
  private readonly functionCallsProcessor: FunctionCallsProcessor;

  public constructor(azureOpenAIClient: AzureOpenAI) {
    this.azureOpenAIClient = azureOpenAIClient;
    this.functionCallsProcessor = new FunctionCallsProcessor();
  }

  public getChatMessageContent = async ({
    model,
    chatHistory,
    executionSettings,
    kernel,
  }: OpenAIChatCompletionParams) => {
    for (let requestIndex = 1; ; requestIndex++) {
      const functionCallingConfig = executionSettings?.functionChoiceBehavior?.getConfiguredOptions({
        requestSequenceIndex: requestIndex,
        chatHistory,
        kernel,
      });

      const chatCompletionCreateParams = createChatCompletionCreateParams(model, chatHistory, executionSettings);

      const chatCompletion = await this.azureOpenAIClient.chat.completions.create(chatCompletionCreateParams);
      const chatMessageContent = new AzureOpenAIChatMessageContent({ chatCompletion, model });

      if (!functionCallingConfig?.autoInvoke) {
        return [chatMessageContent];
      }

      if (!chatCompletion.choices[0].message.tool_calls) {
        return [chatMessageContent];
      }

      await this.functionCallsProcessor.ProcessFunctionCalls({
        chatMessageContent,
        chatHistory,
        requestIndex,
        checkIfFunctionAdvertised: (functionCallContent) =>
          AzureOpenAIChatCompletion.checkIfFunctionAdvertised(functionCallContent, chatCompletionCreateParams.tools),
        kernel,
      });
    }
  };

  private static checkIfFunctionAdvertised(
    functionCallContent: FunctionCallContent,
    tools?: OpenAI.ChatCompletionTool[]
  ) {
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
