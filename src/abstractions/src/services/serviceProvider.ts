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

  /**
   * Get service of a specific type.
   * @param params Parameters for getting the service.
   * @param params.serviceType The type of service to get.
   * @param params.executionSettings Execution settings for the service.
   */
  getService(params: {
    serviceType: AIService['serviceType'];
    executionSettings?: Map<ServiceId, PromptExecutionSettings>;
  }):
    | {
        service: AIService;
        settings?: PromptExecutionSettings;
      }
    | undefined;
}

/**
 * Represents a service provider that uses a map to store services.
 */
export class MapServiceProvider implements ServiceProvider {
  private readonly services: Map<string, AIService> = new Map();

  private getServiceKey = (service: AIService) => service.serviceKey;

  private hasService = (serviceKey: string) => this.services.has(serviceKey);

  private getServicesByType = (serviceType: AIService['serviceType']) => {
    return Array.from(this.services.values()).filter((service) => service.serviceType === serviceType);
  };

  addService = (service: AIService) => {
    const serviceKey = this.getServiceKey(service);

    if (!serviceKey) {
      throw new Error('Service key is not defined.');
    }

    if (this.hasService(serviceKey)) {
      throw new Error(`Service with key ${serviceKey} already exists.`);
    }

    this.services.set(serviceKey, service);
  };

  getServiceByKey = (serviceKey: string) => {
    if (!this.services.has(serviceKey)) {
      throw new Error(`Service with key ${serviceKey} does not exist.`);
    }

    return this.services.get(serviceKey)!;
  };

  getServices = () => this.services.entries();

  getService = ({
    serviceType,
    executionSettings,
  }: {
    serviceType: AIService['serviceType'];
    executionSettings?: Map<ServiceId, PromptExecutionSettings>;
  }) => {
    const services = this.getServicesByType(serviceType);

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
}
