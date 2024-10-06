import { AIService, ModelIdKey, getServiceModelId } from './AIService';

describe('AIService', () => {
  describe('getServiceModelId', () => {
    it('should return the model ID', () => {
      // Arrange
      const stubModelId = 'mockModel';
      const service: AIService = {
        serviceType: 'ChatCompletion',
        serviceKey: 'mockService',
        attributes: new Map([[ModelIdKey, stubModelId]]),
      };

      // Act
      const result = getServiceModelId(service);

      // Assert
      expect(result).toEqual('mockModel');
    });

    it('should return undefined when ModelId is not defined', () => {
      // Arrange
      const service: AIService = {
        serviceType: 'ChatCompletion',
        serviceKey: 'mockService',
        attributes: new Map(),
      };

      // Act
      const result = getServiceModelId(service);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
