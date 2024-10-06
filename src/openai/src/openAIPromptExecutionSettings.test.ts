import { getOpenAIPromptExecutionSettings } from './openAIPromptExecutionSettings';
import { defaultServiceId } from '@semantic-kernel/abstractions';

describe('openAIPromptExecutionSettings', () => {
  describe('getOpenAIPromptExecutionSettings', () => {
    it('should return defaultOpenAIPromptExecutionSettings when executionSettings is undefined', () => {
      // Arrange
      const executionSettings = undefined;
      // Act

      const result = getOpenAIPromptExecutionSettings(executionSettings);

      // Assert
      expect(result).toEqual({
        serviceId: defaultServiceId,
      });
    });

    it('should return defaultOpenAIPromptExecutionSettings when executionSettings is empty', () => {
      // Arrange
      const executionSettings = {};
      // Act

      const result = getOpenAIPromptExecutionSettings(executionSettings);

      // Assert
      expect(result).toEqual({
        serviceId: defaultServiceId,
      });
    });

    it('should return defaultOpenAIPromptExecutionSettings when executionSettings is not empty', () => {
      // Arrange
      const executionSettings = {
        serviceId: 'serviceId',
        temperature: 0.5,
        topP: 0.5,
        presencePenalty: 0.5,
        frequencyPenalty: 0.5,
        maxTokens: 100,
        maxCompletionTokens: 100,
        responseFormat: { type: 'text' },
        seed: 0,
        stop: 'stop',
        chatSystemPrompt: 'chatSystemPrompt',
        toolCallBehavior: { toolId: 'toolId', toolName: 'toolName' },
      };
      // Act

      const result = getOpenAIPromptExecutionSettings(executionSettings);

      // Assert
      expect(result).toEqual(executionSettings);
    });
  });
});
