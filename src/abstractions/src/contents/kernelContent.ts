import { InnerContent } from './InnerContent';
import { ModelId } from './ModelId';

/**
 * Base type for all AI non-streaming results
 */
export abstract class KernelContent {
  // type: 'chat' | 'text' | 'function' | 'functionResult';

  /**
   * The MIME type of the content.
   */
  mimeType?: string;

  /**
   * The inner content representation. Use this to bypass the current abstraction.
   * The usage of this property is considered "unsafe". Use it only if strictly necessary.
   */
  innerContent?: InnerContent;

  /**
   * The model id used to generate the content.
   */
  model?: ModelId;

  /**
   * Metadata associated with the content.
   */
  metadata?: { [key: string]: string | number | object | undefined | null };

  public constructor(props?: KernelContent) {
    this.mimeType = props?.mimeType;
    this.innerContent = props?.innerContent;
    this.model = props?.model;
    this.metadata = props?.metadata;
  }
}
