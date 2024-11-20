import { AzureOpenAIChatCompletion, OpenAIChatCompletionParams } from './completion';
import { EndpointKey, ModelIdKey } from '@semantic-kernel/abstractions';
import { AzureOpenAI } from 'openai';

/**
 * Azure OpenAI provider which provides access to the Azure OpenAI API including chat completions, etc.
 */
export class AzureOpenAIProvider {
  private readonly azureOpenAIClient: AzureOpenAI;
  private readonly openAIChatCompletion: AzureOpenAIChatCompletion;
  private readonly _model: string;
  private readonly _attributes: Map<string, string> = new Map();
  private readonly endpoint: string;

  /**
   * Default Azure OpenAI API version.
   */
  private readonly azureOpenAIVersion = '2024-02-01';

  /**
   * Returns a new Azure OpenAI provider.
   * @param params Azure OpenAI provider parameters.
   * @param params.model Azure OpenAI model id.
   * @param params.apiKey Azure OpenAI API key.
   * @param params.endpoint Azure OpenAI endpoint.
   * @param params.azureOpenAIClient Azure OpenAI client (optional).
   * @returns The Azure OpenAI provider.
   */
  public constructor({
    model,
    apiKey,
    endpoint,
    azureOpenAIClient,
  }: {
    model: string;
    apiKey: string;
    endpoint: string;
    azureOpenAIClient?: AzureOpenAI;
  }) {
    this._model = model;
    this.addAttribute(ModelIdKey, this._model);
    this.endpoint = endpoint;
    this.addAttribute(EndpointKey, this.endpoint);

    this.azureOpenAIClient =
      azureOpenAIClient ??
      new AzureOpenAI({
        apiKey: apiKey,
        apiVersion: this.azureOpenAIVersion,
        deployment: model,
        endpoint: endpoint,
      });

    this.openAIChatCompletion = new AzureOpenAIChatCompletion(this.azureOpenAIClient);
  }

  public async getChatMessageContents(completionParams: Omit<OpenAIChatCompletionParams, 'model'>) {
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
