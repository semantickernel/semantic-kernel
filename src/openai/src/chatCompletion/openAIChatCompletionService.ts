import { OpenAIProvider } from '../provider/openAIProvider';
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
  public readonly attributes: Map<string, string>;
  private readonly provider: OpenAIProvider;
  private readonly model: string;

  /**
   * Get the OpenAI chat completion service.
   *
   * @param params Chat completion parameters.
   * @param param.model OpenAI model id.
   * @param param.apiKey OpenAI API key.
   * @param param.organization OpenAI organization (optional).
   * @param param.provider OpenAI provider (optional).
   */
  public constructor({
    model,
    apiKey,
    organization,
    provider,
  }: {
    model: string;
    apiKey: string;
    organization?: string;
    provider?: OpenAIProvider;
  }) {
    this.model = model;
    this.provider = provider ?? new OpenAIProvider(apiKey, organization);
    this.attributes = this.provider.attributes ?? new Map();
  }

  getChatMessageContents(
    chatHistory: ChatHistory,
    executionSettings?: PromptExecutionSettings,
    kernel?: Kernel
  ): Promise<ChatMessageContent[]> {
    return this.provider.completion({ model: this.model, chatHistory, executionSettings, kernel });
  }
}
