import { OpenAIChatCompletion, OpenAIChatCompletionParams } from './completion';
import OpenAI from 'openai';

export class OpenAIProvider {
  private readonly openAIClient: OpenAI;
  private readonly openAIChatCompletion: OpenAIChatCompletion;

  /**
   * Returns a new OpenAI provider.
   * @param param0 OpenAI provider parameters.
   * @returns The OpenAI provider.
   */
  public constructor({
    apiKey,
    organization,
    openAIClient,
  }: {
    apiKey: string;
    organization?: string;
    openAIClient?: OpenAI;
  }) {
    this.openAIClient =
      openAIClient ??
      new OpenAI({
        apiKey,
        organization,
      });
    this.openAIChatCompletion = new OpenAIChatCompletion(this.openAIClient);
  }

  public async completion(completionParams: OpenAIChatCompletionParams) {
    return this.openAIChatCompletion.getChatMessageContent(completionParams);
  }

  public get attributes() {
    return new Map();
  }
}
