import { OpenAIChatCompletionService } from '@semantic-kernel/openai';
import { useEffect, useState } from 'react';
import { Kernel, kernel } from 'semantic-kernel';

export type useKernelProps = {
  model: string;
  apiKey: string;
  organization?: string;
};

export const useKernel = (props: useKernelProps) => {
  const [sk, setSK] = useState<Kernel | undefined>();

  useEffect(() => {
    if (!sk) {
      setSK(kernel());
    }
  }, []);

  useEffect(() => {
    if (!sk) return;

    sk.addService(new OpenAIChatCompletionService(props));
  }, [sk]);

  return {
    kernel: sk,
  };
};
