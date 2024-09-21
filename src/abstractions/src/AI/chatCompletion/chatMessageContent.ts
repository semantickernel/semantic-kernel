import { FunctionCallContent, KernelContent } from '../../contents';
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
        items: Array<TextContent | FunctionCallContent>;
      }
    | {
        role: 'tool';
        // TODO: do we need to support the Array<TextContent> type here?
        items: TextContent;
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
export const chatMessage = (props: ChatMessageContent) => {
  const message: ChatMessageContent = {
    ...{
      encoding: 'utf-8',
    },
    ...props,
  };

  return message;
};

export const assistantChatMessage = (props: Extract<ChatMessageContent, { role: 'assistant' }>): ChatMessageContent => {
  return chatMessage({
    ...props,
    role: 'assistant',
  });
};

export const systemChatMessage = (content: string): ChatMessageContent => {
  return chatMessage({
    role: 'system',
    items: { type: 'text', text: content },
  });
};

export const userChatMessage = (content: string): ChatMessageContent => {
  return chatMessage({
    role: 'user',
    items: [{ type: 'text', text: content }],
  });
};

export const toolChatMessage = (content: string, metadata?: KernelContent['metadata']): ChatMessageContent => {
  const msg = chatMessage({
    role: 'tool',
    items: { type: 'text', text: content },
  });

  msg.metadata = {
    ...msg.metadata,
    ...metadata,
  };

  return msg;
};
