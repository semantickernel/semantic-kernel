import { AIService, ModelIdKey, getServiceModelId } from './AIService';

class MockService implements AIService {
  readonly serviceType = 'ChatCompletion';
  readonly attributes: Map<string, string> = new Map();

  constructor(modelId?: string) {
    if (modelId) this.attributes.set(ModelIdKey, modelId);
  }
}

describe('AIService', () => {
  describe('getServiceModelId', () => {
    it('should return the model ID', () => {
      // Arrange
      const stubModelId = 'mockModel';
      const mockService = new MockService(stubModelId);

      // Act
      const result = getServiceModelId(mockService);

      // Assert
      expect(result).toEqual('mockModel');
    });

    it('should return undefined when ModelId is not defined', () => {
      // Arrange
      const mockService = new MockService();

      // Act
      const result = getServiceModelId(mockService);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
