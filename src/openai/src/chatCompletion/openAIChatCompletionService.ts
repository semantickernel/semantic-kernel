import { OpenAIProvider } from '../provider/OpenAIProvider';
import {
  ChatCompletionService,
  ChatHistory,
  ChatMessageContent,
  Kernel,
  PromptExecutionSettings,
} from '@semantic-kernel/abstractions';

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
   * @param params.model OpenAI model id.
   * @param params.apiKey OpenAI API key.
   * @param params.endpoint OpenAI endpoint (optional).
   * @param params.organization OpenAI organization (optional).
   * @param params.provider OpenAI provider (optional).
   */
  public constructor({
    model,
    apiKey,
    endpoint,
    organization,
    provider,
  }: {
    model: string;
    apiKey: string;
    endpoint?: string;
    organization?: string;
    provider?: OpenAIProvider;
  }) {
    this.provider = provider ?? new OpenAIProvider({ model, apiKey, endpoint, organization });
  }

  public get attributes() {
    return this.provider.attributes;
  }

  getChatMessageContents(
    chatHistory: ChatHistory,
    executionSettings?: PromptExecutionSettings,
    kernel?: Kernel
  ): Promise<ChatMessageContent[]> {
    return this.provider.completion({ chatHistory, executionSettings, kernel });
  }
}
