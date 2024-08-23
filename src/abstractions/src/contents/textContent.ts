import { KernelContent } from './kernelContent';

/**
 * Represents encoding of the text content.
 */
export type Encoding = 'utf-8';

/**
 * Represents text content return from a text completion service.
 */
export type TextContent = KernelContent & {
  /**
   * Encoding of the text content.
   */
  encoding: Encoding;

  /**
   * Text content.
   */
  text: string;
};
