import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import {
  SemanticKernelUserAgent,
  SemanticKernelVersionHttpHeaderName,
  SemanticKernelVersionHttpHeaderValue,
} from '@semantic-kernel/abstractions';
import { OpenAIProvider } from '@semantic-kernel/openai';
import { AzureOpenAI } from 'openai';
import { EMPTY_OPENAI_API_KEY, OPENAI_AAD_SCOPE } from '../constants';

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
   * @param {string} opts.endpoint - Your Azure endpoint, including the resource, e.g. `https://example-resource.azure.openai.com/`
   * @param {string} opts.apiVersion - Your Azure API version, e.g. `2024-02-01`
   * @param {string | undefined} opts.apiKey - Azure OpenAI API Key (optional).
   * @param {AzureOpenAIProvider | undefined} opts.azureOpenAIClient - Azure OpenAI client (optional).
   */
  public constructor({
    deploymentName,
    endpoint,
    apiVersion,
    apiKey,
    azureOpenAIClient,
  }: {
    deploymentName: string;
    endpoint: string;
    apiVersion: string;
    apiKey?: string;
    azureOpenAIClient?: AzureOpenAI;
  }) {
    if (apiKey) {
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
    } else {
      // EntraIDAuth: get the logged in AD credential and provider
      const aadProvider = getBearerTokenProvider(new DefaultAzureCredential(), OPENAI_AAD_SCOPE);

      super({
        modelId: deploymentName,
        apiKey: EMPTY_OPENAI_API_KEY,
        endpoint,
        openAIClient:
          azureOpenAIClient ??
          new AzureOpenAI({
            endpoint: endpoint,
            apiVersion: apiVersion,
            azureADTokenProvider: aadProvider,
            defaultHeaders: {
              'User-Agent': SemanticKernelUserAgent,
              [SemanticKernelVersionHttpHeaderName]: SemanticKernelVersionHttpHeaderValue,
            },
          }),
      });
    }

    this.deploymentName = deploymentName;
    this.addAttribute(AzureOpenAIProvider.deploymentNameKey, this.deploymentName);
  }
}
