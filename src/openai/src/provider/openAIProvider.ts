import { OpenAIChatCompletionParams, completion } from './completion';
import { ChatMessageContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export interface OpenAIProvider {
  attributes: ReadonlyMap<string, string | number | null>;
  completion(completionParams: OpenAIChatCompletionParams): Promise<Array<ChatMessageContent>>;
}

export type OpenAIProviderParams = {
  apiKey: string;
  organization?: string;
  openAIClient?: OpenAI;
};

/**
 * Returns a new OpenAI provider.
 * @param param0 OpenAI provider parameters.
 * @returns The OpenAI provider.
 */
export const openAIProvider = ({ apiKey, organization, openAIClient }: OpenAIProviderParams): OpenAIProvider => {
  openAIClient =
    openAIClient ??
    new OpenAI({
      apiKey,
      organization,
    });

  return {
    attributes: new Map(),
    completion: completion.bind(this, openAIClient),
  };
};
