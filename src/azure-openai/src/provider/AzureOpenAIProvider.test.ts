import { AzureOpenAIProvider } from './AzureOpenAIProvider';

describe('OpenAIProvider', () => {
  it('should return a new OpenAI provider', () => {
    // Arrange
    // Act
    const mockOpenAIProvider = new AzureOpenAIProvider({
      model: 'testModel',
      apiKey: 'testApiKey',
      endpoint: 'testEndpoint',
    });

    // Assert
    expect(mockOpenAIProvider).toBeDefined();
    expect(mockOpenAIProvider.getChatMessageContents).toBeDefined();
  });
});
