import { ChatMessageContent, TextContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIChatMessageContent<Role> extends ChatMessageContent<Role> {
  public constructor({
    role,
    modelId,
    content,
    items,
  }: {
    role: Role;
    modelId: string;
    content?: string | null;
    items: OpenAIChatMessageContent<Role>['items'];
  }) {
    items = items ?? [];

    if (content) {
      items.push(
        new TextContent({
          text: content,
        })
      );
    }

    super({
      role,
      modelId,
      items,
    });
  }

  public static fromOpenAIChatCompletion({
    chatCompletion,
    modelId,
    items,
  }: {
    chatCompletion: OpenAI.ChatCompletion;
    modelId: string;
    items?: OpenAIChatMessageContent<'assistant'>['items'];
  }) {
    const choice = chatCompletion.choices[0];
    const content = choice.message.content;

    // OpenAI.ChatCompletion's role is always 'assistant'
    return new OpenAIChatMessageContent<'assistant'>({
      role: 'assistant',
      modelId,
      content,
      items: items ?? [],
    });
  }
}
