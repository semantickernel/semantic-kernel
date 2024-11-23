import { StreamingChatMessageContent, StreamingTextContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIStreamingChatMessageContent<Role> extends StreamingChatMessageContent<Role> {
  public finishReason: OpenAI.ChatCompletionChunk.Choice['finish_reason'] | undefined;
  public toolCalls: Array<OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall> | undefined;

  public constructor({
    role,
    modelId,
    content,
    finishReason,
    toolCalls,
    choiceIndex,
    items,
  }: {
    role: Role;
    modelId: string;
    content?: string | null;
    finishReason?: OpenAI.ChatCompletionChunk.Choice['finish_reason'];
    toolCalls?: Array<OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall>;
    choiceIndex?: number;
    items: OpenAIStreamingChatMessageContent<Role>['items'];
  }) {
    if (content) {
      items.push(
        new StreamingTextContent({
          text: content,
        })
      );
    }

    super({
      choiceIndex: choiceIndex ?? 0,
      role,
      modelId,
      items,
    });

    this.finishReason = finishReason;
    this.toolCalls = toolCalls;
  }

  public static fromOpenAIChatCompletionChunk<Role>({
    chatCompletionChunk,
    modelId,
    role,
    items,
  }: {
    chatCompletionChunk: OpenAI.ChatCompletionChunk;
    modelId: string;
    role: Role;
    items: OpenAIStreamingChatMessageContent<Role>['items'];
  }) {
    const choice = chatCompletionChunk.choices[0];
    const content = choice.delta.content;
    const toolCalls = choice.delta.tool_calls;

    return new OpenAIStreamingChatMessageContent<Role>({
      choiceIndex: choice.index,
      role,
      modelId,
      content,
      items,
      finishReason: choice.finish_reason,
      toolCalls,
    });
  }
}
