import { KernelContent } from '../../contents';
import { Encoding } from '../../contents/textContent';
import { AuthorRole } from './authorRole';
import { ChatMessageContentItemCollection } from './chatMessageContentItemCollection';

/**
 * Represents chat message content return from a chat completion service.
 */
export interface ChatMessageContent extends KernelContent {
  /**
   * The name of the author of the chat message.
   */
  authorName?: string;
  /**
   * The role of the author of the chat message.
   */
  authorRole: AuthorRole;
  /**
   * The collection of chat message content items.
   */
  items: ChatMessageContentItemCollection;
  /**
   * The encoding of the chat message content.
   */
  encoding: Encoding;
  /**
   * Represents the source of the message. The source is corresponds to the entity that generated this message.
   * The property is intended to be used by agents to associate themselves with the messages they generate.
   */
  source?: object;
}
