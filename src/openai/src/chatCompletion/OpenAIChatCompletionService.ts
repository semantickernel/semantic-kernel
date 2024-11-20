import { OpenAIProvider } from '../provider/OpenAIProvider';
import { ChatCompletionService, ChatHistory, ChatMessageContent, Kernel, PromptExecutionSettings, TextContent } from '@semantic-kernel/abstractions';


/**
 * OpenAI chat completion service.
 */
export class OpenAIChatCompletionService implements ChatCompletionService {
  public readonly serviceType = 'ChatCompletion';
  public readonly serviceKey = 'openAIChatCompletion';
  private readonly provider: OpenAIProvider;

  /**
   * Get the OpenAI chat completion service.
   *
   * @param params Chat completion parameters.
   * @param params.modelId OpenAI model id.
   * @param params.apiKey OpenAI API key.
   * @param params.endpoint OpenAI endpoint (optional).
   * @param params.organization OpenAI organization (optional).
   * @param params.provider OpenAI provider (optional).
   */
  public constructor({
    modelId,
    apiKey,
    endpoint,
    organization,
    provider,
  }: {
    modelId: string;
    apiKey: string;
    endpoint?: string;
    organization?: string;
    provider?: OpenAIProvider;
  }) {
    this.provider = provider ?? new OpenAIProvider({ modelId, apiKey, endpoint, organization });
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
  }): Promise<ChatMessageContent[]> {
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
  }
  ) {
    if (prompt) {
      chatHistory = [new ChatMessageContent<'user'>({ role: 'user', items: [new TextContent({ text: prompt })] })];
    }

    if (!chatHistory) {
      throw new Error('Either prompt or chatHistory is required for chat completion.');
    }

    return this.provider.getStreamingChatMessageContents({ chatHistory, executionSettings, kernel });
  }
}
