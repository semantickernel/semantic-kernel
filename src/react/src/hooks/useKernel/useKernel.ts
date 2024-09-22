import { openAIChatCompletionService } from '@semantic-kernel/openai';
import { useEffect, useState } from 'react';
import { Kernel, kernel } from 'semantic-kernel';

export type useKernelProps = Parameters<typeof openAIChatCompletionService>[0];

export const useKernel = (props: useKernelProps) => {
  const [sk, setSK] = useState<Kernel | undefined>();

  useEffect(() => {
    if (!sk) {
      setSK(kernel());
    }
  }, []);

  useEffect(() => {
    if (!sk) return;

    sk.addService(openAIChatCompletionService(props));
  }, [sk]);

  return {
    kernel: sk,
  };
};
