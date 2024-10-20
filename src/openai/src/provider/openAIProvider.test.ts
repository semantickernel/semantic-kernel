import { openAIProvider } from './openAIProvider';

describe('openAIProvider', () => {
  it('should return a new OpenAI provider', () => {
    // Arrange
    // Act
    const mockOpenAIProvider = openAIProvider({
      apiKey: 'testApiKey',
    });

    // Assert
    expect(mockOpenAIProvider).toBeDefined();
    expect(mockOpenAIProvider.completion).toBeDefined();
  });
});
