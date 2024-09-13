import { OpenAIPromptExecutionSettings, getOpenAIPromptExecutionSettings } from './openAIPromptExecutionSettings';
import { ChatHistory, ChatMessageContent, systemChatMessage } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export interface OpenAIProvider {
  completion(completionParams: OpenAIChatCompletionParams): Promise<ChatMessageContent>;
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
};

export const createOpenAI = ({ apiKey, organization, openAIClient }: OpenAIProviderParams) => {
  const getOrCreateOpenAIClient = () =>
    openAIClient ??
    new OpenAI({
      apiKey,
      organization,
    });

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
      // TODO
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
      // TODO
    }

    throw new Error(`Unsupported chat message role: ${message.role}`);
  };

  const createChatCompletionCreateParams = (
    model: string,
    chatHistory: ChatHistory,
    promptExecutionSettings?: OpenAIPromptExecutionSettings
  ): OpenAI.Chat.ChatCompletionCreateParams => {
    const executionSettings = getOpenAIPromptExecutionSettings(promptExecutionSettings);
    let messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Add the system prompt if provided first
    if (executionSettings.chatSystemPrompt && !chatHistory.find((message) => message.role === 'system')) {
      messages = [...messages, ...createChatCompletionMessages(systemChatMessage(executionSettings.chatSystemPrompt))];
    }

    for (const chatMessage of chatHistory) {
      messages = [...messages, ...createChatCompletionMessages(chatMessage)];
    }

    return {
      model,
      temperature: executionSettings.temperature,
      top_p: executionSettings.topP,
      messages,
    };
  };

  const completion = async ({ model, chatHistory, executionSettings }: OpenAIChatCompletionParams) => {
    const client = getOrCreateOpenAIClient();
    return client.chat.completions.create(createChatCompletionCreateParams(model, chatHistory, executionSettings));
  };

  return {
    completion,
  };
};
