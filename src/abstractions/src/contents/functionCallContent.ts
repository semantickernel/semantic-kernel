import { KernelContent } from './kernelContent';

export type FunctionCallContent<Arguments> = KernelContent & {
  id?: string;
  functionName: string;
  pluginName?: string;
  arguments?: Arguments;
};
