import { OpenAIProvider } from './OpenAIProvider';

describe('OpenAIProvider', () => {
  it('should return a new OpenAI provider', () => {
    // Arrange
    // Act
    const mockOpenAIProvider = new OpenAIProvider({
      model: 'testModel',
      apiKey: 'testApiKey',
    });

    // Assert
    expect(mockOpenAIProvider).toBeDefined();
    expect(mockOpenAIProvider.getChatMessageContents).toBeDefined();
  });
});
