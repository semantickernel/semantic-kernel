import { ChatCompletionService, ChatMessageContent, TextContent } from '@semantic-kernel/abstractions';

export class MockChatCompletionService implements ChatCompletionService {
  public readonly serviceType = 'ChatCompletion';
  public readonly serviceKey = 'mockChatCompletionService';
  public readonly attributes = new Map<string, string>();

  getChatMessageContents = async ({ prompt }: { prompt: string }) => {
    return Promise.resolve([
      new ChatMessageContent<'assistant'>({
        role: 'assistant',
        model: 'test',
        items: [new TextContent({ text: prompt })],
      }),
    ]);
  };
}
