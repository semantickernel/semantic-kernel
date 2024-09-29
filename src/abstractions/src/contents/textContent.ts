import { KernelContent } from './kernelContent';

/**
 * Represents encoding of the text content.
 */
export type Encoding = 'utf-8';

/**
 * Represents text content return from a text completion service.
 */
export type TextContent = KernelContent & {
  type: 'text';

  /**
   * Encoding of the text content.
   */
  encoding?: Encoding;

  /**
   * Text content.
   */
  text: string;
};

/**
 * Create a {@link TextContent} from text.
 * @param props The text content properties.
 * @returns The text content.
 */
export const textContent = (props: Omit<TextContent, 'type'>) => {
  const message: TextContent = {
    ...props,
    type: 'text',
    encoding: 'utf-8',
  };

  return message;
};
