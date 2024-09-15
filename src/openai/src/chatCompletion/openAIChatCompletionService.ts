import { OpenAIProvider, createOpenAI } from '../openAIProvider';
import { ChatCompletionService } from '@semantic-kernel/abstractions';

/**
 * Get the OpenAI chat completion service.
 * @param model OpenAI model id.
 * @param apiKey OpenAI API key.
 * @param organization OpenAI organization (optional).
 */
export const openAIChatCompletionService = (
  model: string,
  apiKey: string,
  organization?: string,
  openAIProvider?: OpenAIProvider
): ChatCompletionService => {
  openAIProvider = openAIProvider ?? createOpenAI({ apiKey, organization });

  return {
    attributes: openAIProvider.attributes,
    serviceKey: 'openAIChatCompletion',
    getChatMessageContents: async (chatHistory, executionSettings, kernel) => {
      return openAIProvider.completion({ model, chatHistory, executionSettings, kernel });
    },
  };
};
