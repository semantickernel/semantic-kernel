import { ChatMessageContent, TextContent, chatMessage } from '@semantic-kernel/abstractions';
import { ChatCompletion } from 'openai/resources';

export type OpenAIChatMessageContent = ChatMessageContent;

export const createOpenAIChatMessageContent = (
  chatCompletion: ChatCompletion,
  modelId: string
): OpenAIChatMessageContent => {
  const role = chatCompletion.choices[0].message.role;
  const content = chatCompletion.choices[0].message.content;

  const textContent: TextContent = {
    type: 'text',
    text: content ?? '',
  };

  return {
    ...chatMessage({
      modelId,
      role,
      items: [textContent],
    }),
  };
};
