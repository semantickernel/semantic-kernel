import { FunctionCallContent, StreamingKernelContent, StreamingTextContent } from '.';
import { Encoding, FunctionResultContent } from '.';

/**
 * Abstraction of chat message content chunks when using streaming from {@link ChatCompletionService} interface.
 */
export class StreamingChatMessageContent<
  Role = 'system' | 'author' | 'user' | 'assistant' | 'tool',
> extends StreamingKernelContent {
  /**
   * Role of the author of the chat message.
   */
  role: Role;

  /**
   * Chat message content items.
   */
  items: Role extends 'system'
    ? StreamingTextContent
    : Role extends 'author'
      ? Array<StreamingTextContent>
      : Role extends 'user'
        ? Array<StreamingTextContent>
        : Role extends 'assistant'
          ? Array<StreamingTextContent | FunctionCallContent>
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
  private _encoding?: Encoding;

  public get encoding(): Encoding | undefined {
    if (this.items instanceof StreamingTextContent) {
      return this.items.encoding;
    }

    if (this.items instanceof Array) {
      const textContents = this.items.filter((item) => item instanceof StreamingTextContent) as StreamingTextContent[];
      if (textContents.length > 0) {
        return textContents[0].encoding;
      }
      return this._encoding;
    }

    return this._encoding;
  }

  public set encoding(value: Encoding) {
    this._encoding = value;

    if (this.items instanceof StreamingTextContent) {
      this.items.encoding = value;
    }

    if (this.items instanceof Array) {
      const textContents = this.items.filter((item) => item instanceof StreamingTextContent) as StreamingTextContent[];
      textContents[0].encoding = value;
    }
  }

  /**
   * Represents the source of the message. The source is corresponds to the entity that generated this message.
   * The property is intended to be used by agents to associate themselves with the messages they generate.
   */
  source?: object;

  constructor({
    role,
    items,
    authorName,
    encoding,
    source,
    ...props
  }: {
    role: Role;
    items: StreamingChatMessageContent<Role>['items'];
    authorName?: string;
    encoding?: Encoding;
    source?: object;
  } & StreamingKernelContent) {
    super(props);
    this.role = role;
    this.items = items;
    this.authorName = authorName;
    this._encoding = encoding;
    this.source = source;
  }
}
