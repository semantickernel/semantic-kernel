import { OpenAIChatCompletion, OpenAIChatCompletionParams } from './completion';
import { EndpointKey, ModelIdKey } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

/**
 * OpenAI provider which provides access to the OpenAI API including chat completions, etc.
 */
export class OpenAIProvider {
  private readonly openAIClient: OpenAI;
  private readonly openAIChatCompletion: OpenAIChatCompletion;
  private readonly _modelId: string;
  private readonly _attributes: Map<string, string> = new Map();
  private readonly endpoint: string;

  /**
   * Default OpenAI API endpoint.
   */
  private readonly OpenAIV1Endpoint = 'https://api.openai.com/v1';

  /**
   * Returns a new OpenAI provider.
   * @param params OpenAI provider parameters.
   * @param params.modelId OpenAI model id.
   * @param params.apiKey OpenAI API key.
   * @param params.endpoint OpenAI endpoint (optional).
   * @param params.organization OpenAI organization (optional).
   * @param params.openAIClient OpenAI client (optional).
   * @returns The OpenAI provider.
   */
  public constructor({
    modelId,
    apiKey,
    endpoint,
    organization,
    openAIClient,
  }: {
    modelId: string;
    apiKey: string;
    endpoint?: string;
    organization?: string;
    openAIClient?: OpenAI;
  }) {
    this._modelId = modelId;
    this.addAttribute(ModelIdKey, this._modelId);

    this.endpoint = endpoint ?? this.OpenAIV1Endpoint;
    this.addAttribute(EndpointKey, this.endpoint);

    this.openAIClient =
      openAIClient ??
      new OpenAI({
        apiKey,
        organization,
        baseURL: this.endpoint,
      });

    this.openAIChatCompletion = new OpenAIChatCompletion(this.openAIClient);
  }

  public getChatMessageContents(completionParams: Omit<OpenAIChatCompletionParams, 'modelId'>) {
    return this.openAIChatCompletion.getChatMessageContent({
      ...completionParams,
      modelId: this._modelId,
    });
  }

  public getStreamingChatMessageContents(completionParams: Omit<OpenAIChatCompletionParams, 'modelId'>) {
    return this.openAIChatCompletion.getChatMessageContentStream({
      ...completionParams,
      modelId: this._modelId,
    });
  }

  public get attributes() {
    return this._attributes;
  }

  private addAttribute(key: string, value: string) {
    if (!this._attributes.has(key)) {
      this._attributes.set(key, value);
    }
  }
}
