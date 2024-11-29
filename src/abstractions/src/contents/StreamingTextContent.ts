import { Encoding } from './Encoding';
import { InnerContent } from './InnerContent';
import { ModelId } from './ModelId';
import { StreamingKernelContent } from './StreamingKernelContent';

/**
 * Abstraction of text content chunks.
 */
export class StreamingTextContent extends StreamingKernelContent {
  /**
   * The text associated to the update.
   */
  text?: string;

  /**
   * Encoding of the text content.
   */
  encoding: Encoding;

  constructor(props: {
    text?: string;
    choiceIndex?: number;
    model?: ModelId;
    innerContent?: InnerContent;
    encoding?: Encoding;
    metadata?: { [key: string]: string | number | object | undefined | null };
  }) {
    super({ ...props, choiceIndex: props.choiceIndex ?? 0 });
    this.text = props.text;
    this.encoding = props.encoding ?? 'utf-8';
  }
}
