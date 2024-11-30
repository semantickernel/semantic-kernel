import { AzureOpenAIProvider } from './AzureOpenAIProvider';

describe('AzureOpenAIProvider', () => {
  it('should return a new Azure OpenAI provider', () => {
    // Arrange
    // Act
    const mockOpenAIProvider = new AzureOpenAIProvider({
      deploymentName: 'testDeploymentName',
      apiKey: 'testApiKey',
      endpoint: 'testEndpoint',
    });

    // Assert
    expect(mockOpenAIProvider).toBeDefined();
    expect(mockOpenAIProvider.getChatMessageContents).toBeDefined();
  });
});
