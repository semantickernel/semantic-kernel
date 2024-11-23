import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import { OpenAIPromptExecutionSettings, getOpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { createChatCompletionMessages } from './chatCompletionMessage';
import {
  ChatHistory,
  ChatMessageContent,
  FunctionChoiceBehaviorConfiguration,
  FunctionName,
  TextContent,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export const createChatCompletionCreateParams = ({
  modelId,
  chatHistory,
  executionSettings,
  functionChoiceBehaviorConfiguration,
}: {
  modelId: string;
  chatHistory: ChatHistory;
  executionSettings?: OpenAIPromptExecutionSettings;
  functionChoiceBehaviorConfiguration?: FunctionChoiceBehaviorConfiguration;
}): OpenAI.ChatCompletionCreateParamsNonStreaming => {
  const openAIExecutionSettings = getOpenAIPromptExecutionSettings(executionSettings);
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  let tools: OpenAI.ChatCompletionTool[] | undefined;
  let toolChoice: OpenAI.ChatCompletionToolChoiceOption | undefined;

  // Add the system prompt if provided first
  if (openAIExecutionSettings.chatSystemPrompt && !chatHistory.find((message) => message.role === 'system')) {
    messages = [
      ...messages,
      ...createChatCompletionMessages(
        new ChatMessageContent({
          role: 'system',
          items: [new TextContent({ text: openAIExecutionSettings.chatSystemPrompt })],
        })
      ),
    ];
  }

  for (const chatMessage of chatHistory) {
    messages = [...messages, ...createChatCompletionMessages(chatMessage)];
  }

  if (functionChoiceBehaviorConfiguration?.functions) {
    tools = [];
    for (const kernelFunction of functionChoiceBehaviorConfiguration.functions) {
      const { name: functionName, pluginName, schema, description } = kernelFunction.metadata ?? {};

      if (!functionName) {
        continue;
      }

      tools.push({
        type: 'function',
        function: {
          description,
          name: FunctionName.fullyQualifiedName({
            functionName,
            pluginName,
            nameSeparator: OpenAIFunctionNameSeparator,
          }),
          parameters: schema as OpenAI.FunctionParameters,
        },
      });
    }

    toolChoice = functionChoiceBehaviorConfiguration.choice;
  }

  return {
    model: modelId,
    temperature: openAIExecutionSettings.temperature,
    top_p: openAIExecutionSettings.topP,
    presence_penalty: openAIExecutionSettings.presencePenalty,
    frequency_penalty: openAIExecutionSettings.frequencyPenalty,
    max_tokens: openAIExecutionSettings.maxTokens,
    response_format: openAIExecutionSettings.responseFormat,
    seed: openAIExecutionSettings.seed,
    stop: openAIExecutionSettings.stop,
    messages,
    tools,
    tool_choice: toolChoice,
  };
};
