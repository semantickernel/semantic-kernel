import { FunctionCallContent, KernelContent } from '../../contents';
import { Encoding, FunctionResultContent, TextContent } from '../../contents';

/**
 * Represents chat message content return from a chat completion service.
 */
export class ChatMessageContent<Role = 'system' | 'author' | 'user' | 'assistant' | 'tool'> extends KernelContent {
  /**
   * Role of the author of the chat message.
   */
  role: Role;

  /**
   * Chat message content items.
   */
  items: Role extends 'system'
    ? TextContent
    : Role extends 'author'
      ? Array<TextContent>
      : Role extends 'user'
        ? Array<TextContent>
        : Role extends 'assistant'
          ? Array<TextContent | FunctionCallContent>
          : Role extends 'tool'
            ? FunctionResultContent<unknown>
            : never;
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

  constructor(props: ChatMessageContent<Role>) {
    super();
    this.role = props.role;
    this.items = props.items;
    this.authorName = props.authorName;
    this.encoding = props.encoding;
    this.source = props.source;
  }
}

// /**
//  * Create a {@link ChatMessageContent} from content or items.
//  */
// export const chatMessage = (props: ChatMessageContent) => {
//   const message: ChatMessageContent = {
//     ...props,
//     type: 'chat',
//     encoding: 'utf-8',
//   };
//
//   return message;
// };
//
// /**
//  * Create an assistant {@link ChatMessageContent}.
//  * @param props The chat message properties.
//  * @returns The assistant chat message.
//  */
// export const assistantChatMessage = (
//   props: Omit<Extract<ChatMessageContent, { role: 'assistant' }>, 'type' | 'role'>
// ): ChatMessageContent => {
//   return chatMessage({
//     ...props,
//     type: 'chat',
//     role: 'assistant',
//   });
// };
//
// /**
//  * Create a system {@link ChatMessageContent}.
//  * @param content The content of the system message.
//  * @returns The system chat message.
//  */
// export const systemChatMessage = (content: string): ChatMessageContent => {
//   return chatMessage({
//     // TODO: fix the "type" to avoid passing it explicitly
//     type: 'chat',
//     role: 'system',
//     items: { type: 'text', text: content },
//   });
// };
//
// /**
//  * Create a user {@link ChatMessageContent}.
//  * @param content The content of the user message.
//  * @returns The user chat message.
//  */
// export const userChatMessage = (content: string): ChatMessageContent => {
//   return chatMessage({
//     type: 'chat',
//     role: 'user',
//     items: [{ type: 'text', text: content }],
//   });
// };
//
// /**
//  * Create a tool {@link ChatMessageContent}.
//  * @param props The tool message properties.
//  * @param metadata The metadata of the tool message.
//  * @returns The tool chat message.
//  */
// export const toolChatMessage = <T>(props: Omit<FunctionResultContent<T>, 'type'>): ChatMessageContent => {
//   const msg = chatMessage({
//     type: 'chat',
//     role: 'tool',
//     items: {
//       type: 'functionResult',
//       ...props,
//     },
//   });
//
//   return msg;
// };
