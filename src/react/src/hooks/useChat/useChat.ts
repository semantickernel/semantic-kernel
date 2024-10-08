import { useKernel, useKernelProps } from '../useKernel';
import { ChatCompletionService, ChatHistory, userChatMessage } from '@semantic-kernel/abstractions';
import { useEffect, useState } from 'react';

type useChatProps = useKernelProps;

export const useChat = (props: useChatProps) => {
  const { kernel } = useKernel(props);
  const [chatCompletionService, setChatCompletionService] = useState<ChatCompletionService>();
  const [chatHistory, setChatHistory] = useState<ChatHistory>([]);

  useEffect(() => {
    if (!kernel) return;

    const chatCompletionService = kernel.serviceProvider.getService({
      serviceType: 'ChatCompletion',
    })?.service as ChatCompletionService;

    if (!chatCompletionService) {
      throw new Error('ChatCompletion service not found');
    }

    setChatCompletionService(chatCompletionService);
  }, [kernel]);

  const prompt = async (prompt: string) => {
    if (!chatCompletionService) {
      console.error('ChatCompletion service not found');
      return;
    }

    const newChatHistory = [...chatHistory, userChatMessage(prompt)];
    setChatHistory(newChatHistory);

    const chatMessageContents = await chatCompletionService.getChatMessageContents(newChatHistory, undefined, kernel);

    for (const chatMessageContent of chatMessageContents) {
      setChatHistory((chatHistory) => [...chatHistory, chatMessageContent]);
    }
  };

  return {
    prompt,
    chatHistory,
  };
};
