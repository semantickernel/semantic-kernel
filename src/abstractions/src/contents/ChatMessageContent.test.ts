import { FunctionCallContent, TextContent } from '.';
import { ChatMessageContent } from './ChatMessageContent';

describe('ChatMessageContent', () => {
  describe('chatMessage', () => {
    it('should be able to create a chat message', () => {
      // Arrange
      const role = 'user';
      const items = [new TextContent({ text: 'test' })];

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
    });
  });

  describe('assistantChatMessage', () => {
    it('should be able to create an assistant chat message with an array of TextContent', () => {
      // Arrange
      const role = 'assistant';
      const items: TextContent[] = [new TextContent({ text: 'test' }), new TextContent({ text: 'test2' })];

      // Act
      const result = new ChatMessageContent<typeof role>({ role, items });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
    });

    it('should be able to create an assistant chat message with an array of FunctionCallContent', () => {
      // Arrange
      const role = 'assistant';
      const items: FunctionCallContent[] = [
        new FunctionCallContent({ functionName: 'test' }),
        new FunctionCallContent({ functionName: 'test2' }),
      ];

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.items).toStrictEqual(items);
    });
  });

  describe('systemChatMessage', () => {
    it('should be able to create a system chat message', () => {
      // Arrange
      const role = 'system';
      const items = new TextContent({ text: 'test' });

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
    });
  });

  describe('userChatMessage', () => {
    it('should be able to create a user chat message', () => {
      // Arrange
      const role = 'user';
      const items = [new TextContent({ text: 'test' })];

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
    });
  });

  describe('toolChatMessage', () => {
    it('should be able to create a tool chat message', () => {
      // Arrange
      const role = 'tool';
      const items = new TextContent({ text: 'text' });

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
    });

    it('should be able to create a tool chat message with metadata', () => {
      // Arrange
      const role = 'tool';
      const items = new TextContent({ text: 'test' });
      const metadata = { type: 'test' };

      // Act
      const result = new ChatMessageContent<typeof role>({
        role,
        items,
        metadata,
      });

      // Assert
      expect(result.role).toEqual(role);
      expect(result.encoding).toEqual('utf-8');
      expect(result.items).toStrictEqual(items);
      expect(result.metadata).toStrictEqual(metadata);
    });
  });
});
