import { InnerContent } from './innerContent';
import { ModelId } from './modelId';

/**
 * Base type for all AI non-streaming results
 */
export type KernelContent = {
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
  modelId?: ModelId;

  /**
   * Metadata associated with the content.
   */
  metadata?: Map<string, object>;
};
