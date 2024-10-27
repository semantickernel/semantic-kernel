import { FunctionCallContent, TextContent } from '../../contents';
import {
  ChatMessageContent,
  assistantChatMessage,
  chatMessage,
  systemChatMessage,
  toolChatMessage,
  userChatMessage,
} from './ChatMessageContent';

describe('ChatMessageContent', () => {
  describe('chatMessage', () => {
    it('should be able to create a chat message', () => {
      // Arrange
      const props: ChatMessageContent = {
        type: 'chat',
        role: 'user',
        items: [{ type: 'text', text: 'test' }],
      };

      // Act
      const result = chatMessage(props);

      // Assert
      expect(result).toEqual({
        ...props,
        type: 'chat',
        encoding: 'utf-8',
      });
    });
  });

  describe('assistantChatMessage', () => {
    it('should be able to create an assistant chat message with an array of TextContent', () => {
      // Arrange
      const items: TextContent[] = [
        { type: 'text', text: 'test' },
        { type: 'text', text: 'test2' },
      ];

      // Act
      const result = assistantChatMessage({ items });

      // Assert
      expect(result).toEqual({
        items,
        role: 'assistant',
        type: 'chat',
        encoding: 'utf-8',
      });
    });

    it('should be able to create an assistant chat message with an array of FunctionCallContent', () => {
      // Arrange
      const items: FunctionCallContent[] = [
        { type: 'function', functionName: 'test' },
        { type: 'function', functionName: 'test2' },
      ];

      // Act
      const result = assistantChatMessage({
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
      const result = systemChatMessage(content);

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
      const result = userChatMessage(content);

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
      const result = toolChatMessage(content);

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
      const result = toolChatMessage(content, metadata);

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
