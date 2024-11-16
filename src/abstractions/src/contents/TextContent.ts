import { InnerContent } from './InnerContent';
import { KernelContent } from './KernelContent';
import { ModelId } from './ModelId';
import { Encoding } from './Encoding';

/**
 * Represents text content return from a text completion service.
 */
export class TextContent extends KernelContent {
  /**
   * Encoding of the text content.
   */
  encoding: Encoding;

  /**
   * The text content.
   */
  text?: string;

  constructor(props: {
    text?: string;
    modelId?: ModelId;
    innerContent?: InnerContent;
    encoding?: Encoding;
    metadata?: { [key: string]: string | number | object | undefined | null };
  }) {
    super(props);
    this.text = props.text;
    this.encoding = props.encoding ?? 'utf-8';
  }

  override toString(): string {
    return this.text ?? '';
  }
}
