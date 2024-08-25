import { AIService } from './AIService';

/**
 * Represents a service provider.
 */
export interface ServiceProvider {
  /**
   * Gets a service by key.
   * @param serviceKey The key of the service.
   */
  getService(serviceKey: string): AIService;
  /**
   * Gets all services.
   */
  getServices(): Iterator<[string, AIService]>;
  /**
   * Adds a service.
   * @param service The service to add.
   */
  addService(service: AIService): void;
}

export const getServiceProvider = (): ServiceProvider => {
  const services: Map<string, AIService> = new Map();

  const getServiceKey = (service: AIService): string => service.serviceKey;

  const hasService = (serviceKey: string) => services.has(serviceKey);

  const addService = (service: AIService) => {
    const serviceKey = getServiceKey(service);

    if (!serviceKey) {
      throw new Error('Service key is not defined.');
    }

    if (hasService(serviceKey)) {
      throw new Error(`Service with key ${serviceKey} already exists.`);
    }

    services.set(serviceKey, service);
  };

  const getService = (serviceKey: string) => {
    if (!services.has(serviceKey)) {
      throw new Error(`Service with key ${serviceKey} does not exist.`);
    }

    return services.get(serviceKey)!;
  };

  const getServices = () => services.entries();

  return {
    getService,
    getServices,
    addService,
  };
};
