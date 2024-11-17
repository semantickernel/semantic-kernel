import { ChatMessageContent, FunctionCallContent, TextContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIChatMessageContent extends ChatMessageContent<'assistant'> {
  public constructor({ chatCompletion, modelId }: { chatCompletion: OpenAI.ChatCompletion; modelId: string }) {
    const choice = chatCompletion.choices[0];
    const content = choice.message.content;
    const items: Array<TextContent | FunctionCallContent> = [];

    if (content) {
      items.push(
        new TextContent({
          text: content,
        })
      );
    }

    // OpenAI.ChatCompletion's role is always 'assistant'
    super({
      role: 'assistant',
      modelId,
      items,
    });
  }
}
