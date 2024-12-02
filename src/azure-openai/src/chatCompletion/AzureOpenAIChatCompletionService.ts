import { AzureOpenAIProvider } from '../provider/AzureOpenAIProvider';
import { ChatCompletionService, ChatHistory, ChatMessageContent, Kernel, PromptExecutionSettings, TextContent } from '@semantic-kernel/abstractions';

/**
 * Azure OpenAI chat completion service.
 */
export class AzureOpenAIChatCompletionService implements ChatCompletionService {
  readonly serviceType = 'ChatCompletion';
  private readonly provider: AzureOpenAIProvider;

  /**
   * Get the Azure OpenAI chat completion service.
   *
   * @param params Chat completion parameters.
   * @param params.model Azure OpenAI model id.
   * @param params.apiKey Azure OpenAI API key.
   * @param params.endpoint Azure OpenAI endpoint.
   * @param params.provider Azure OpenAI provider (optional).
   */
  public constructor({
    deploymentName,
    apiKey,
    endpoint,
    apiVersion,
    provider,
  }: {
    deploymentName: string;
    apiKey: string;
    endpoint: string;
    apiVersion: string;
    provider?: AzureOpenAIProvider;
  }) {
    this.provider = provider ?? new AzureOpenAIProvider({ deploymentName, apiKey, endpoint, apiVersion });
  }

  public get attributes() {
    return this.provider.attributes;
  }

  getChatMessageContents({
    prompt,
    chatHistory,
    executionSettings,
    kernel,
  }: {
    prompt?: string;
    chatHistory?: ChatHistory;
    executionSettings?: PromptExecutionSettings;
    kernel?: Kernel;
  }) {
    if (prompt) {
      chatHistory = [new ChatMessageContent<'user'>({ role: 'user', items: [new TextContent({ text: prompt })] })];
    }

    if (!chatHistory) {
      throw new Error('Either prompt or chatHistory is required for chat completion.');
    }

    return this.provider.getChatMessageContents({ chatHistory, executionSettings, kernel });
  }

  getStreamingChatMessageContents({
    prompt,
    chatHistory,
    executionSettings,
    kernel,
  }: {
    prompt?: string;
    chatHistory?: ChatHistory;
    executionSettings?: PromptExecutionSettings;
    kernel?: Kernel;
  }) {
    if (prompt) {
      chatHistory = [new ChatMessageContent<'user'>({ role: 'user', items: [new TextContent({ text: prompt })] })];
    }

    if (!chatHistory) {
      throw new Error('Either prompt or chatHistory is required for chat completion.');
    }

    return this.provider.getStreamingChatMessageContents({ chatHistory, executionSettings, kernel });
  }
}
