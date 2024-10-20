import { OpenAIChatMessageContent, createOpenAIChatMessageContent } from '../../chatCompletion';
import { openAIFullyQualifiedName } from '../../functionName';
import { OpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { createChatCompletionCreateParams } from './chatCompletionParams';
import { ChatHistory, FunctionCallContent, FunctionCallsProcessor, Kernel } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export type OpenAIChatCompletionParams = {
  model: string;
  chatHistory: ChatHistory;
  executionSettings?: OpenAIPromptExecutionSettings;
  kernel?: Kernel;
};

const checkIfFunctionAdvertised = (functionCallContent: FunctionCallContent, tools?: OpenAI.ChatCompletionTool[]) => {
  if (!tools) {
    return false;
  }

  for (const tool of tools) {
    if (tool.type !== 'function') {
      continue;
    }

    if (
      tool.function.name ===
      openAIFullyQualifiedName({
        functionName: functionCallContent.functionName,
        pluginName: functionCallContent.pluginName,
      })
    ) {
      return true;
    }
  }

  return false;
};

export const completion = async (
  openAIClient: OpenAI,
  { model, chatHistory, executionSettings, kernel }: OpenAIChatCompletionParams
) => {
  const functionCallsProcessor = new FunctionCallsProcessor();

  for (let requestIndex = 1; ; requestIndex++) {
    // TODO record completion activity
    const functionCallingConfig = executionSettings?.functionChoiceBehavior?.getConfiguredOptions({
      requestSequenceIndex: requestIndex,
      chatHistory,
      kernel,
    });
    //const toolCallingConfig = getToolCallingConfig(requestIndex, kernel, executionSettings);
    const chatCompletionCreateParams = createChatCompletionCreateParams(
      model,
      chatHistory,
      executionSettings,
      functionCallingConfig
    );
    const chatCompletion = await openAIClient.chat.completions.create(chatCompletionCreateParams);
    const chatMessageContent: OpenAIChatMessageContent = createOpenAIChatMessageContent(chatCompletion, model);

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

    await functionCallsProcessor.ProcessFunctionCalls({
      chatMessageContent,
      chatHistory,
      requestIndex,
      checkIfFunctionAdvertised: (functionCallContent) =>
        checkIfFunctionAdvertised(functionCallContent, chatCompletionCreateParams.tools),
      kernel,
    });
  }
};
