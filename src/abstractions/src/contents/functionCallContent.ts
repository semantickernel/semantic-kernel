import { ChatMessageContent } from '../AI';
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

export const getFunctionCalls = (chatMessageContent: ChatMessageContent) => {
  if (chatMessageContent.items instanceof Array) {
    return chatMessageContent.items.filter((item) => item.type === 'function') as FunctionCallContent[];
  }
};
