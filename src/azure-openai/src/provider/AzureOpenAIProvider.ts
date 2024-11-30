import { OpenAIProvider } from '@semantic-kernel/openai';
import { AzureOpenAI } from 'openai';

/**
 * Azure OpenAI provider which provides access to the Azure OpenAI API including chat completions, etc.
 */
export class AzureOpenAIProvider extends OpenAIProvider {
  /**
   * Default Azure OpenAI API version.
   */
  private static readonly azureOpenAIVersion = '2024-02-01';

  private static readonly deploymentNameKey = 'DeploymentName';
  private readonly deploymentName: string;

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
    deploymentName,
    apiKey,
    endpoint,
    azureOpenAIClient,
  }: {
    deploymentName: string;
    apiKey: string;
    endpoint: string;
    azureOpenAIClient?: AzureOpenAI;
  }) {
    super({
      modelId: deploymentName,
      apiKey: apiKey,
      endpoint: endpoint,
      openAIClient:
        azureOpenAIClient ??
        new AzureOpenAI({
          apiKey: apiKey,
          apiVersion: AzureOpenAIProvider.azureOpenAIVersion,
          deployment: deploymentName,
          endpoint: endpoint,
        }),
    });

    this.deploymentName = deploymentName;
    this.addAttribute(AzureOpenAIProvider.deploymentNameKey, this.deploymentName);
  }
}
