import {
  SemanticKernelUserAgent,
  SemanticKernelVersionHttpHeaderName,
  SemanticKernelVersionHttpHeaderValue,
} from '@semantic-kernel/abstractions';
import { OpenAIProvider } from '@semantic-kernel/openai';
import { AzureOpenAI } from 'openai';

/**
 * Azure OpenAI provider which provides access to the Azure OpenAI API including chat completions, etc.
 */
export class AzureOpenAIProvider extends OpenAIProvider {
  private static readonly deploymentNameKey = 'DeploymentName';
  private readonly deploymentName: string;

  /**
   * API Client for interfacing with the Azure OpenAI API.
   *
   * @param {string} opts.deploymentName - Model deployment name.
   * @param {string} opts.apiKey - Azure endpoint API Key.
   * @param {string} opts.endpoint - Your Azure endpoint, including the resource, e.g. `https://example-resource.azure.openai.com/`
   * @param {string} opts.apiVersion - Your Azure API version, e.g. `2024-02-01`
   * @param {AzureOpenAIProvider | undefined} opts.azureOpenAIClient - Azure OpenAI client (optional).
   */
  public constructor({
    deploymentName,
    apiKey,
    endpoint,
    apiVersion,
    azureOpenAIClient,
  }: {
    deploymentName: string;
    apiKey: string;
    endpoint: string;
    apiVersion: string;
    azureOpenAIClient?: AzureOpenAI;
  }) {
    super({
      modelId: deploymentName,
      apiKey,
      endpoint,
      openAIClient:
        azureOpenAIClient ??
        new AzureOpenAI({
          apiKey,
          apiVersion,
          deployment: deploymentName,
          defaultHeaders: {
            'User-Agent': SemanticKernelUserAgent,
            [SemanticKernelVersionHttpHeaderName]: SemanticKernelVersionHttpHeaderValue,
          },
          endpoint,
        }),
    });

    this.deploymentName = deploymentName;
    this.addAttribute(AzureOpenAIProvider.deploymentNameKey, this.deploymentName);
  }
}
