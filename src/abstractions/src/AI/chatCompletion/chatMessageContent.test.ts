import { FunctionCallContent, TextContent } from '../../contents';
import { ChatMessageContent } from './ChatMessageContent';

describe('ChatMessageContent', () => {
  describe('chatMessage', () => {
    it('should be able to create a chat message', () => {
      // Arrange
      const props: ChatMessageContent = {
        role: 'user',
        items: [new TextContent({ text: 'test' })],
      };

      // Act
      const result = new ChatMessageContent(props);

      // Assert
      expect(result).toEqual({
        ...props,
        encoding: 'utf-8',
      });
    });
  });

  describe('assistantChatMessage', () => {
    it('should be able to create an assistant chat message with an array of TextContent', () => {
      // Arrange
      const items: TextContent[] = [new TextContent({ text: 'test' }), new TextContent({ text: 'test2' })];

      // Act
      const result = new ChatMessageContent<'assistant'>({ role: 'assistant', items });

      // Assert
      expect(result).toEqual({
        items,
        role: 'assistant',
        encoding: 'utf-8',
      });
    });

    it('should be able to create an assistant chat message with an array of FunctionCallContent', () => {
      // Arrange
      const items: FunctionCallContent[] = [
        new FunctionCallContent({ functionName: 'test' }),
        new FunctionCallContent({ functionName: 'test2' }),
      ];

      // Act
      const result = new ChatMessageContent<'assistant'>({
        role: 'assistant',
        items,
      });

      // Assert
      expect(result).toEqual({
        items,
        role: 'assistant',
        type: 'chat',
        encoding: 'utf-8',
      });
    });
  });

  describe('systemChatMessage', () => {
    it('should be able to create a system chat message', () => {
      // Arrange
      const content = 'test';

      // Act
      const result = new ChatMessageContent<'system'>({
        role: 'system',
        items: new TextContent({ text: content }),
      });

      // Assert
      expect(result).toEqual({
        role: 'system',
        type: 'chat',
        items: { type: 'text', text: content },
        encoding: 'utf-8',
      });
    });
  });

  describe('userChatMessage', () => {
    it('should be able to create a user chat message', () => {
      // Arrange
      const content = 'test';

      // Act
      const result = new ChatMessageContent<'user'>({
        role: 'user',
        items: [new TextContent({ text: content })],
      });

      // Assert
      expect(result).toEqual({
        role: 'user',
        type: 'chat',
        items: [{ type: 'text', text: content }],
        encoding: 'utf-8',
      });
    });
  });

  describe('toolChatMessage', () => {
    it('should be able to create a tool chat message', () => {
      // Arrange
      const content = 'test';

      // Act
      const result = new ChatMessageContent<'tool'>({
        role: 'tool',
        items: new TextContent({ text: content }),
      });

      // Assert
      expect(result).toEqual({
        role: 'tool',
        type: 'chat',
        items: { type: 'text', text: content },
        encoding: 'utf-8',
      });
    });

    it('should be able to create a tool chat message with metadata', () => {
      // Arrange
      const content = 'test';
      const metadata = { type: 'test' };

      // Act
      const result = new ChatMessageContent<'tool'>({
        role: 'tool',
        items: new TextContent({ text: content }),
        metadata,
      });

      // Assert
      expect(result).toEqual({
        role: 'tool',
        type: 'chat',
        items: { type: 'text', text: content },
        metadata,
        encoding: 'utf-8',
      });
    });
  });
});
