import { KernelContent } from './KernelContent';

/**
 * Represents encoding of the text content.
 */
export type Encoding = 'utf-8' | 'ascii';

/**
 * Represents text content return from a text completion service.
 */
export class TextContent extends KernelContent {
  /**
   * Encoding of the text content.
   */
  encoding: Encoding;

  /**
   * Text content.
   */
  text: string;

  constructor(props: { text: string; encoding?: Encoding }) {
    super();
    this.text = props.text;
    this.encoding = props.encoding ?? 'utf-8';
  }

  override toString(): string {
    return this.text;
  }
}
