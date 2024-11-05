import { Kernel } from '../../Kernel';
import { AIService } from '../../services/AIService';
import { PromptExecutionSettings } from '../PromptExecutionSettings';
import { ChatHistory } from './ChatHistory';
import { ChatMessageContent } from './ChatMessageContent';
import { StreamingChatMessageContent } from './StreamingChatMessageContent';

/**
 * Interface for chat completion services.
 */
export interface ChatCompletionService extends AIService {
  /**
   * Get chat multiple chat content choices for the prompt and settings.
   */
  getChatMessageContents(params: {
    prompt?: string;
    chatHistory?: ChatHistory;
    executionSettings?: PromptExecutionSettings;
    kernel?: Kernel;
  }): Promise<ChatMessageContent[]>;

  /**
   * Get streaming chat contents for the chat history provided using the specified settings.
   */
  getStreamingChatMessageContents?(
    chatHistory: ChatHistory,
    executionSettings?: PromptExecutionSettings,
    kernel?: Kernel
  ): Promise<StreamingChatMessageContent>;
}
