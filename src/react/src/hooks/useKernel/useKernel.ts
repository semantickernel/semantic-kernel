import { OpenAIChatCompletionService } from '@semantic-kernel/openai';
import { useEffect, useState } from 'react';
import { ChatCompletionService, Kernel, kernel } from 'semantic-kernel';

export type useKernelProps = {
  openAIModel?: string;
  openAIApiKey?: string;
  openAIorganization?: string;
  kernel?: Kernel;
  chatCompletionService?: ChatCompletionService;
};

export const useKernel = (props: useKernelProps) => {
  const [sk, setSK] = useState<Kernel | undefined>();

  useEffect(() => {
    if (!sk) {
      setSK(props.kernel ?? kernel());
    }
  }, []);

  useEffect(() => {
    if (!sk) return;

    if (props.chatCompletionService) {
      sk.addService(props.chatCompletionService);
    } else if (props.openAIApiKey && props.openAIModel) {
      sk.addService(
        new OpenAIChatCompletionService({
          modelId: props.openAIModel,
          apiKey: props.openAIApiKey,
          organization: props.openAIorganization,
        })
      );
    } else {
      throw new Error('Either chatCompletionService or openAIModel and openAIApiKey are required.');
    }
  }, [sk]);

  return {
    kernel: sk,
  };
};
