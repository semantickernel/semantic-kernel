import { AIService } from './AIService';
import { getServiceProvider } from './serviceProvider';

const MockService = (): AIService => {
  return {
    serviceKey: 'mockService',
    attributes: new Map(),
  };
};

describe('serviceProvider', () => {
  describe('addService', () => {
    it('should add a service', () => {
      // Arrange
      const serviceProvider = getServiceProvider();
      const mockService = MockService();

      // Act
      serviceProvider.addService(mockService);

      // Assert
      expect(serviceProvider.getServices().next().value).toEqual(['mockService', mockService]);
    });
  });

  describe('getService', () => {
    it('should get a service', () => {
      // Arrange
      const serviceProvider = getServiceProvider();
      const mockService = MockService();
      serviceProvider.addService(mockService);

      // Act
      const service = serviceProvider.getService('mockService');

      // Assert
      expect(service).toEqual(mockService);
    });
  });
});
