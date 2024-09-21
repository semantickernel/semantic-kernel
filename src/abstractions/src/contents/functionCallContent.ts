import { KernelContent } from './kernelContent';

export type FunctionCallContent = KernelContent & {
  id?: string;
  functionName: string;
  pluginName?: string;
  arguments?: Record<string, unknown>;
};
