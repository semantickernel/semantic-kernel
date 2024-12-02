import {
  FunctionCallContent,
  StreamingFunctionCallUpdateContent,
  StreamingKernelContent,
  StreamingTextContent,
} from '.';
import { Encoding, FunctionResultContent } from '.';

/**
 * Abstraction of chat message content chunks when using streaming from {@link ChatCompletionService} service.
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
    ? Array<StreamingTextContent>
    : Role extends 'author'
      ? Array<StreamingTextContent>
      : Role extends 'user'
        ? Array<StreamingTextContent>
        : Role extends 'assistant'
          ? Array<StreamingTextContent | FunctionCallContent | StreamingFunctionCallUpdateContent>
          : Role extends 'tool'
            ? Array<FunctionResultContent>
            : never;

  /**
   * The name of the author of the chat message.
   */
  authorName?: string;

  /**
   * The encoding of the chat message content.
   *
   * @todo _encoding property should be private/protected in theory but I had to make it public to avoid the
   * "Property '_encoding' of exported anonymous class type may not be private or protected.ts(4094)" error.
   */
  _encoding?: Encoding;

  public get encoding(): Encoding | undefined {
    const textContents = this.items.filter((item) => item instanceof StreamingTextContent) as StreamingTextContent[];
    if (textContents.length > 0) {
      return textContents[0].encoding;
    }

    return this._encoding;
  }

  public set encoding(value: Encoding) {
    this._encoding = value;

    const textContents = this.items.filter((item) => item instanceof StreamingTextContent) as StreamingTextContent[];

    if (textContents.length > 0) {
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
