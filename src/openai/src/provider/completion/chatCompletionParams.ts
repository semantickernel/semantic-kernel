import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import { OpenAIPromptExecutionSettings, getOpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { createChatCompletionMessages } from './chatCompletionMessage';
import {
  ChatHistory,
  ChatMessageContent,
  FunctionChoiceBehaviorConfiguration,
  TextContent,
  fullyQualifiedName,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  FunctionParameters,
} from 'openai/resources';

export const createChatCompletionCreateParams = (
  model: string,
  chatHistory: ChatHistory,
  promptExecutionSettings?: OpenAIPromptExecutionSettings,
  functionChoiceBehaviorConfiguration?: FunctionChoiceBehaviorConfiguration
): ChatCompletionCreateParamsNonStreaming => {
  const executionSettings = getOpenAIPromptExecutionSettings(promptExecutionSettings);
  let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  let tools: ChatCompletionTool[] | undefined;
  let toolChoice: ChatCompletionToolChoiceOption | undefined;

  // Add the system prompt if provided first
  if (executionSettings.chatSystemPrompt && !chatHistory.find((message) => message.role === 'system')) {
    messages = [
      ...messages,
      ...createChatCompletionMessages(
        new ChatMessageContent({
          role: 'system',
          items: new TextContent({ text: executionSettings.chatSystemPrompt }),
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
          name: fullyQualifiedName({
            functionName,
            pluginName,
            nameSeparator: OpenAIFunctionNameSeparator,
          }),
          parameters: schema as FunctionParameters,
        },
      });
    }

    toolChoice = functionChoiceBehaviorConfiguration.choice;
  }

  return {
    model,
    temperature: executionSettings.temperature,
    top_p: executionSettings.topP,
    presence_penalty: executionSettings.presencePenalty,
    frequency_penalty: executionSettings.frequencyPenalty,
    max_tokens: executionSettings.maxTokens,
    response_format: executionSettings.responseFormat,
    seed: executionSettings.seed,
    stop: executionSettings.stop,
    messages,
    tools,
    tool_choice: toolChoice,
  };
};
