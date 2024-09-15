import { Kernel } from '../../kernel';
import { AIService } from '../../services/AIService';
import { PromptExecutionSettings } from '../promptExecutionSettings';
import { ChatHistory } from './chatHistory';
import { ChatMessageContent } from './chatMessageContent';
import { StreamingChatMessageContent } from './streamingChatMessageContent';

/**
 * Interface for chat completion services.
 */
export interface ChatCompletionService extends AIService {
  /**
   * Get chat multiple chat content choices for the prompt and settings.
   */
  getChatMessageContents(
    chatHistory: ChatHistory,
    executionSettings?: PromptExecutionSettings,
    kernel?: Kernel
  ): Promise<ChatMessageContent[]>;
  /**
   * Get streaming chat contents for the chat history provided using the specified settings.
   */
  getStreamingChatMessageContents?(
    chatHistory: ChatHistory,
    executionSettings?: PromptExecutionSettings,
    kernel?: Kernel
  ): Promise<StreamingChatMessageContent>;
}
