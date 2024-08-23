import { KernelContent } from './kernelContent';

export type Encoding = 'utf-8';

export type TextContent = KernelContent & {
  encoding: Encoding;
  text: string;
};
