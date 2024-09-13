import { Encoding } from '../../contents';
import { StreamingKernelContent } from '../../contents/streamingKernelContent';

/**
 * Abstraction of chat message content chunks when using streaming from {@link IChatCompletionService} interface.
 * Represents a chat message content chunk that was streamed from the remote model.
 */
export type StreamingChatMessageContent = StreamingKernelContent &
  (
    | {
        role: 'system';
        items: StreamingKernelContent;
      }
    | {
        role: 'author';
        items: Array<StreamingKernelContent>;
      }
    | {
        role: 'user';
        items: Array<StreamingKernelContent>;
      }
    | {
        role: 'assistant';
        items: Array<StreamingKernelContent>;
      }
    | {
        role: 'tool';
        items: Array<StreamingKernelContent>;
      }
  ) & {
    /**
     * The name of the author of the chat message.
     */
    authorName?: string;
    /**
     * The encoding of the chat message content.
     */
    encoding?: Encoding;
  };
