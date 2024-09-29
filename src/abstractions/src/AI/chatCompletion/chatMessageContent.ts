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
    type: 'chat';

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
    ...props,
    type: 'chat',
    encoding: 'utf-8',
  };

  return message;
};

/**
 * Create an assistant {@link ChatMessageContent}.
 * @param props The chat message properties.
 * @returns The assistant chat message.
 */
export const assistantChatMessage = (
  props: Omit<Extract<ChatMessageContent, { role: 'assistant' }>, 'type'>
): ChatMessageContent => {
  return chatMessage({
    ...props,
    type: 'chat',
    role: 'assistant',
  });
};

/**
 * Create a system {@link ChatMessageContent}.
 * @param content The content of the system message.
 * @returns The system chat message.
 */
export const systemChatMessage = (content: string): ChatMessageContent => {
  return chatMessage({
    // TODO: fix the "type" to avoid passing it explicitly
    type: 'chat',
    role: 'system',
    items: { type: 'text', text: content },
  });
};

/**
 * Create a user {@link ChatMessageContent}.
 * @param content The content of the user message.
 * @returns The user chat message.
 */
export const userChatMessage = (content: string): ChatMessageContent => {
  return chatMessage({
    type: 'chat',
    role: 'user',
    items: [{ type: 'text', text: content }],
  });
};

/**
 * Create a tool {@link ChatMessageContent}.
 * @param content The content of the tool message.
 * @param metadata The metadata of the tool message.
 * @returns The tool chat message.
 */
export const toolChatMessage = (content: string, metadata?: KernelContent['metadata']): ChatMessageContent => {
  const msg = chatMessage({
    type: 'chat',
    role: 'tool',
    items: { type: 'text', text: content },
  });

  msg.metadata = {
    ...msg.metadata,
    ...metadata,
  };

  return msg;
};
