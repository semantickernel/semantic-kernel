import { OpenAIChatCompletion, OpenAIChatCompletionParams } from './completion';
import {
  EndpointKey,
  ModelIdKey,
  SemanticKernelUserAgent,
  SemanticKernelVersionHttpHeaderName,
  SemanticKernelVersionHttpHeaderValue,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

/**
 * OpenAI provider which provides access to the OpenAI API including chat completions, etc.
 */
export class OpenAIProvider {
  private readonly openAIClient: OpenAI;
  private readonly openAIChatCompletion: OpenAIChatCompletion;
  private readonly modelId: string;
  private readonly _attributes: Map<string, string> = new Map();
  private readonly endpoint: string;

  /**
   * Default OpenAI API endpoint.
   */
  private readonly OpenAIV1Endpoint = 'https://api.openai.com/v1';

  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string} opts.modelId - OpenAI model id.
   * @param {string} opts.apiKey - OpenAI API key.
   * @param {string | undefined} opts.endpoint - Your OpenAI endpoint.
   * @param {string | undefined} opts.organization - OpenAI organization.
   * @param {OpenAIProvider | undefined} opts.openAIClient - OpenAI Client (optional).
   */
  public constructor({
    modelId: _modelId,
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
    this.modelId = _modelId;
    this.addAttribute(ModelIdKey, this.modelId);

    this.endpoint = endpoint ?? this.OpenAIV1Endpoint;
    this.addAttribute(EndpointKey, this.endpoint);

    this.openAIClient =
      openAIClient ??
      new OpenAI({
        apiKey,
        organization,
        baseURL: this.endpoint,
        defaultHeaders: {
          'User-Agent': SemanticKernelUserAgent,
          [SemanticKernelVersionHttpHeaderName]: SemanticKernelVersionHttpHeaderValue,
        },
      });

    this.openAIChatCompletion = new OpenAIChatCompletion(this.openAIClient);
  }

  getChatMessageContents(completionParams: Omit<OpenAIChatCompletionParams, 'modelId'>) {
    return this.openAIChatCompletion.getChatMessageContent({
      ...completionParams,
      modelId: this.modelId,
    });
  }

  getStreamingChatMessageContents(completionParams: Omit<OpenAIChatCompletionParams, 'modelId'>) {
    return this.openAIChatCompletion.getChatMessageContentStream({
      ...completionParams,
      modelId: this.modelId,
    });
  }

  get attributes() {
    return this._attributes;
  }

  protected addAttribute(key: string, value: string) {
    if (!this._attributes.has(key)) {
      this._attributes.set(key, value);
    }
  }
}
