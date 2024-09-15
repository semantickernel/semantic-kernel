import { KernelContent } from '../../contents';
import { Encoding, TextContent } from '../../contents/textContent';

/**
 * Represents chat message content return from a chat completion service.
 */
export type ChatMessageContent = KernelContent &
  (
    | {
        role: 'system';
        items: TextContent;
      }
    | {
        role: 'author';
        items: Array<TextContent>;
      }
    | {
        role: 'user';
        items: Array<TextContent>;
      }
    | {
        role: 'assistant';
        items: Array<TextContent>;
      }
    | {
        role: 'tool';
        items: Array<KernelContent>;
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
    /**
     * Represents the source of the message. The source is corresponds to the entity that generated this message.
     * The property is intended to be used by agents to associate themselves with the messages they generate.
     */
    source?: object;
  };

/**
 * Create a {@link ChatMessageContent} from content or items.
 */
export const chatMessage = (props: ChatMessageContent): ChatMessageContent => {
  const message: ChatMessageContent = {
    ...{
      encoding: 'utf-8',
    },
    ...props,
  };

  return message;
};

export const systemChatMessage = (content: string): ChatMessageContent => {
  return chatMessage({
    role: 'system',
    items: { type: 'text', text: content },
  });
};
