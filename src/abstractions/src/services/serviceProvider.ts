import { PromptExecutionSettings, ServiceId } from '../AI';
import { AIService, getServiceModelId } from './AIService';

/**
 * Represents a service provider.
 */
export interface ServiceProvider {
  /**
   * Gets a service by key.
   * @param serviceKey The key of the service.
   */
  getServiceByKey(serviceKey: string): AIService;
  /**
   * Gets all services.
   */
  getServices(): Iterator<[string, AIService]>;
  /**
   * Adds a service.
   * @param service The service to add.
   */
  addService(service: AIService): void;

  getService(props: {
    serviceType: AIService['serviceType'];
    executionSettings?: Map<ServiceId, PromptExecutionSettings>;
  }):
    | {
        service: AIService;
        settings?: PromptExecutionSettings;
      }
    | undefined;
}

export const getServiceProvider = (): ServiceProvider => {
  const services: Map<string, AIService> = new Map();

  const getServiceKey = (service: AIService) => service.serviceKey;

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

  const getServiceByKey = (serviceKey: string) => {
    if (!services.has(serviceKey)) {
      throw new Error(`Service with key ${serviceKey} does not exist.`);
    }

    return services.get(serviceKey)!;
  };

  const getServices = () => services.entries();

  const getServicesByType = (serviceType: AIService['serviceType']) => {
    return Array.from(services.values()).filter((service) => service.serviceType === serviceType);
  };

  const getService = ({
    serviceType,
    executionSettings,
  }: {
    serviceType: AIService['serviceType'];
    executionSettings?: Map<ServiceId, PromptExecutionSettings>;
  }) => {
    const services = getServicesByType(serviceType);

    if (!services.length) {
      return undefined;
    }

    if (!executionSettings || executionSettings.size === 0) {
      // return the first service if no execution settings are provided
      return {
        service: services[0],
        settings: undefined,
      };
    }

    // search by service id first
    for (const [serviceId, settings] of executionSettings) {
      const service = services.find((s) => s.serviceKey === serviceId);
      if (service) {
        return {
          service,
          settings,
        };
      }
    }

    // search by model id next
    for (const settings of executionSettings.values()) {
      const modelId = settings.modelId;
      const service = services.find((s) => getServiceModelId(s) === modelId);
      if (service) {
        return {
          service,
          settings,
        };
      }
    }

    // TODO: handle default service case

    return undefined;
  };

  return {
    getServiceByKey,
    getServices,
    addService,
    getService,
  };
};
