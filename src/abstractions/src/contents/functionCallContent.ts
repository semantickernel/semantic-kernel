import { KernelContent } from './kernelContent';

export type FunctionCallContent = KernelContent & {
  type: 'function';
  id?: string;
  functionName: string;
  pluginName?: string;
  arguments?: Record<string, unknown>;
};

export const functionCallContent = (props: Omit<FunctionCallContent, 'type'>) => {
  const message: FunctionCallContent = {
    ...props,
    type: 'function',
  };

  return message;
};
