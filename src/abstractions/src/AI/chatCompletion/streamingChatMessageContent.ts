import { Encoding } from '../../contents';
import { StreamingKernelContent } from '../../contents/streamingKernelContent';
import { AuthorRole } from './authorRole';
import { StreamingKernelContentItemCollection } from './streamingKernelContentItemCollection';

/**
 * Abstraction of chat message content chunks when using streaming from {@link IChatCompletionService} interface.
 * Represents a chat message content chunk that was streamed from the remote model.
 */
export interface StreamingChatMessageContent extends StreamingKernelContent {
  /**
   * The name of the author of the chat message.
   */
  authorName?: string;
  /**
   * The role of the author of the chat message.
   */
  authorRole?: AuthorRole;
  /**
   * The collection of chat message content items.
   */
  items: StreamingKernelContentItemCollection[];
  /**
   * The encoding of the chat message content.
   */
  encoding: Encoding;
}
