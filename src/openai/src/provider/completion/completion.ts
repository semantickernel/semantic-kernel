import {
  OpenAIChatMessageContent,
  createOpenAIChatMessageContent,
  getOpenAIChatMessageContentToolCalls,
} from '../../chatCompletion';
import { OpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { createChatCompletionCreateParams } from './chatCompletionParams';
import { getToolCallingConfig } from './toolCallingConfig';
import { ChatHistory, Kernel, toolChatMessage } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export type OpenAIChatCompletionParams = {
  model: string;
  chatHistory: ChatHistory;
  executionSettings?: OpenAIPromptExecutionSettings;
  kernel?: Kernel;
};

export const completion = async (
  openAIClient: OpenAI,
  { model, chatHistory, executionSettings, kernel }: OpenAIChatCompletionParams
) => {
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
        throw new Error(`Function "${toolCall.functionName}" in plugin "${toolCall.pluginName}" returned null result.`);
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
