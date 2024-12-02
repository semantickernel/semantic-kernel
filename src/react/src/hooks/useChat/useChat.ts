import { useKernel, useKernelProps } from '../useKernel';
import { ChatCompletionService, ChatHistory, ChatMessageContent, TextContent } from '@semantic-kernel/abstractions';
import { useEffect, useState } from 'react';

export type useChatProps = useKernelProps;

export const useChat = (props: useChatProps) => {
  const { kernel } = useKernel(props);
  const [chatCompletionService, setChatCompletionService] = useState<ChatCompletionService>();
  const [chatHistory, setChatHistory] = useState<ChatHistory>([]);

  useEffect(() => {
    if (!kernel) return;

    const chatCompletionService = kernel.services.trySelectAIService({
      serviceType: 'ChatCompletion',
    })?.service;

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

    const newChatHistory = [
      ...chatHistory,
      new ChatMessageContent<'user'>({
        role: 'user',
        items: [new TextContent({ text: prompt })],
      }),
    ];
    setChatHistory(newChatHistory);

    const chatMessageContents = await chatCompletionService.getChatMessageContents({
      chatHistory: newChatHistory,
      kernel,
    });

    for (const chatMessageContent of chatMessageContents) {
      setChatHistory((chatHistory) => [...chatHistory, chatMessageContent]);
    }
  };

  return {
    prompt,
    chatHistory,
  };
};
