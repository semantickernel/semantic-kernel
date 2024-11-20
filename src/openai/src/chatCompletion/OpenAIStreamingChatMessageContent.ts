import { FunctionCallContent, StreamingChatMessageContent, StreamingTextContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIStreamingChatMessageContent extends StreamingChatMessageContent<'assistant'> {
  public finishReason: OpenAI.ChatCompletionChunk.Choice['finish_reason'];

  public constructor({ chatCompletion, modelId }: { chatCompletion: OpenAI.ChatCompletionChunk; modelId: string }) {
    const choice = chatCompletion.choices[0];
    const content = choice.delta.content;
    const items: Array<StreamingTextContent | FunctionCallContent> = [];

    if (content) {
      items.push(
        new StreamingTextContent({
          text: content,
        })
      );
    }

    // OpenAI.ChatCompletion's role is always 'assistant'
    super({
      choiceIndex: choice.index,
      role: 'assistant',
      modelId,
      items,
    });

    this.finishReason = choice.finish_reason;
  }
}
