import { OpenAIProvider } from '../provider/openAIProvider';
import { ChatCompletionService } from '@semantic-kernel/abstractions';

/**
 * Get the OpenAI chat completion service.
 * @param model OpenAI model id.
 * @param apiKey OpenAI API key.
 * @param organization OpenAI organization (optional).
 */
export const openAIChatCompletionService = ({
  model,
  apiKey,
  organization,
  provider,
}: {
  model: string;
  apiKey: string;
  organization?: string;
  provider?: OpenAIProvider;
}): ChatCompletionService => {
  provider = provider ?? new OpenAIProvider(apiKey, organization);

  return {
    serviceType: 'ChatCompletion',
    serviceKey: 'openAIChatCompletion',
    attributes: provider.attributes,
    getChatMessageContents: async (chatHistory, executionSettings, kernel) => {
      return provider.completion({ model, chatHistory, executionSettings, kernel });
    },
  };
};
