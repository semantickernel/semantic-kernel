import { PromptExecutionSettings, ServiceId } from '../AI';
import { AIService, AIServiceType, ModelIdKey } from './AIService';
import { MapServiceProvider } from './ServiceProvider';

const MockService = (serviceType?: AIServiceType, serviceKey?: string, modelId?: string): AIService => {
  return {
    serviceType: serviceType ?? 'ChatCompletion',
    serviceKey: serviceKey ?? 'mockService',
    attributes: new Map([[ModelIdKey, modelId ?? 'mockModel']]),
  };
};

describe('MapServiceProvider', () => {
  describe('addService', () => {
    it('should add a service', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();
      const mockService = MockService();

      // Act
      serviceProvider.addService(mockService);

      // Assert
      expect(serviceProvider.getServices().next().value).toEqual(['mockService', mockService]);
    });

    it('should not add the same serviceKey twice', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();
      const mockService = MockService();

      // Act
      serviceProvider.addService(mockService);

      // Assert
      expect(() => {
        serviceProvider.addService(mockService);
      }).toThrow('Service with key mockService already exists.');
    });
  });

  describe('getServiceByKey', () => {
    it('should throw an error when service is not defined', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();

      // Act
      const action = () => serviceProvider.getServiceByKey('ChatCompletion1');

      // Assert
      expect(action).toThrow('Service with key ChatCompletion1 does not exist.');
    });

    it('should get a service', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();
      const mockService = MockService();
      serviceProvider.addService(mockService);

      // Act
      const service = serviceProvider.getServiceByKey('mockService');

      // Assert
      expect(service).toEqual(mockService);
    });
  });

  describe('getService', () => {
    it('should return undefined when service is not defined', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();

      // Act
      const service = serviceProvider.getService({
        serviceType: 'ChatCompletion',
      });

      // Assert
      expect(service).toBeUndefined();
    });

    it('should get a service without ExecutionSettings', () => {
      // Arrange
      const serviceProvider = new MapServiceProvider();
      const mockService = MockService();
      serviceProvider.addService(mockService);

      // Act
      const service = serviceProvider.getService({
        serviceType: 'ChatCompletion',
      });

      // Assert
      expect(service).toEqual({
        service: mockService,
        settings: undefined,
      });
    });

    it('should get a service with ExecutionSettings and serviceKey', () => {
      // Arrange
      const stubServiceKey = 'mockService2';
      const stubPromptExecutionSettings = { modelId: 'gpt' };
      const stubExecutionSettings = new Map<ServiceId, PromptExecutionSettings>();
      stubExecutionSettings.set(stubServiceKey, stubPromptExecutionSettings);
      const serviceProvider = new MapServiceProvider();

      const mockService1 = MockService('ChatCompletion', 'mockService1');
      serviceProvider.addService(mockService1);

      const mockService2 = MockService('ChatCompletion', stubServiceKey);
      serviceProvider.addService(mockService2);

      // Act
      const service = serviceProvider.getService({
        serviceType: 'ChatCompletion',
        executionSettings: stubExecutionSettings,
      });

      // Assert
      expect(service).toEqual({
        service: mockService2,
        settings: stubPromptExecutionSettings,
      });
    });

    it('should get a service with ExecutionSettings and modelId', () => {
      // Arrange
      const stubPromptExecutionSettings = { modelId: 'gpt' };
      const stubExecutionSettings = new Map<ServiceId, PromptExecutionSettings>();
      stubExecutionSettings.set('randomService', stubPromptExecutionSettings);
      const serviceProvider = new MapServiceProvider();

      const mockService1 = MockService('ChatCompletion', 'mockService1');
      serviceProvider.addService(mockService1);

      const mockService2 = MockService('ChatCompletion', 'mockService2', stubPromptExecutionSettings.modelId);
      serviceProvider.addService(mockService2);

      // Act
      const service = serviceProvider.getService({
        serviceType: 'ChatCompletion',
        executionSettings: stubExecutionSettings,
      });

      // Assert
      expect(service).toEqual({
        service: mockService2,
        settings: stubPromptExecutionSettings,
      });
    });
  });
});
