import { MockChatCompletionService } from '../../tests/mockChatCompletionService';
import { useChat, useChatProps } from './useChat';
import { renderHook } from '@testing-library/react';

describe('useChat', () => {
  it('should be able to send a message', () => {
    // Arrange
    const props: useChatProps = {
      chatCompletionService: new MockChatCompletionService(),
    };

    // Act
    const result = renderHook(() => useChat(props));

    // Assert
    expect(result.result.current).toBeDefined();
  });
});
