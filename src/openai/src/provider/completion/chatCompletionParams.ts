import { OpenAIPromptExecutionSettings, getOpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { createChatCompletionMessages } from './chatCompletionMessage';
import { getToolCallingConfig } from './toolCallingConfig';
import { ChatHistory, systemChatMessage } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from 'openai/resources';

export const createChatCompletionCreateParams = (
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
