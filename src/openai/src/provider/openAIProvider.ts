import { OpenAIChatCompletion, OpenAIChatCompletionParams } from './completion';
import { EndpointKey, ModelIdKey } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIProvider {
  private readonly openAIClient: OpenAI;
  private readonly openAIChatCompletion: OpenAIChatCompletion;
  private readonly _model: string;
  private readonly _attributes: Map<string, string> = new Map();
  private readonly endpoint: string;

  /**
   * Default OpenAI API endpoint.
   */
  private readonly OpenAIV1Endpoint = 'https://api.openai.com/v1';

  /**
   * Returns a new OpenAI provider.
   * @param params OpenAI provider parameters.
   * @param params.model OpenAI model id.
   * @param params.apiKey OpenAI API key.
   * @param params.endpoint OpenAI endpoint (optional).
   * @param params.organization OpenAI organization (optional).
   * @param params.openAIClient OpenAI client (optional).
   * @returns The OpenAI provider.
   */
  public constructor({
    model,
    apiKey,
    endpoint,
    organization,
    openAIClient,
  }: {
    model: string;
    apiKey: string;
    endpoint?: string;
    organization?: string;
    openAIClient?: OpenAI;
  }) {
    this._model = model;

    this.endpoint = endpoint ?? this.OpenAIV1Endpoint;
    this.addAttribute(EndpointKey, this.endpoint);

    this.openAIClient =
      openAIClient ??
      new OpenAI({
        apiKey,
        organization,
        baseURL: this.endpoint,
      });

    this.addAttribute(ModelIdKey, model);

    this.openAIChatCompletion = new OpenAIChatCompletion(this.openAIClient);
  }

  public async completion(completionParams: Omit<OpenAIChatCompletionParams, 'model'>) {
    return this.openAIChatCompletion.getChatMessageContent({
      ...completionParams,
      model: this._model,
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
