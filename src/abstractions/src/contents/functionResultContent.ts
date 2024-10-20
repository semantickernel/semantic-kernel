import { KernelContent } from './kernelContent';

export type FunctionResultContent<T> = KernelContent & {
  type: 'functionResult';
  callId?: string;
  pluginName?: string;
  functionName?: string;
  result?: T;
};

export const functionResultContent = <T>(props: Omit<FunctionResultContent<T>, 'type'>) => {
  const message: FunctionResultContent<T> = {
    ...props,
    type: 'functionResult',
  };

  return message;
};
