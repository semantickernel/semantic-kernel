import { ChatCompletionService, PromptExecutionSettings, defaultServiceId } from '../AI';
import { KernelFunction } from '../functions';
import { KernelArguments } from '../functions/KernelArguments';
import { JsonSchema } from '../jsonSchema';
import { AIService, AIServiceType, getServiceModelId } from './AIService';

/**
 * Maps an AIServiceType to the corresponding service.
 */
type ServiceMapping<T> = T extends 'ChatCompletion' ? ChatCompletionService : AIService;

/**
 * Represents a service provider.
 */
export interface ServiceProvider {
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
  trySelectAIService<T extends AIServiceType>(params: {
    serviceType: T;
    kernelFunction?: KernelFunction<JsonSchema>;
    kernelArguments?: KernelArguments<JsonSchema, unknown>;
  }):
    | {
        service: ServiceMapping<T>;
        executionSettings?: PromptExecutionSettings;
      }
    | undefined;
}

/**
 * Represents a service provider that uses a map to store services.
 */
export class MapServiceProvider implements ServiceProvider {
  private readonly services: Map<string, AIService> = new Map();

  addService(service: AIService) {
    const serviceId = this.getServiceId(service);

    if (this.hasService(serviceId)) {
      throw new Error(`Service id "${serviceId}" is already registered.`);
    }

    this.services.set(serviceId, service);
  }

  trySelectAIService<T extends AIServiceType>({
    serviceType,
    kernelFunction,
    kernelArguments,
  }: {
    serviceType: T;
    kernelFunction?: KernelFunction<JsonSchema>;
    kernelArguments?: KernelArguments<JsonSchema, unknown>;
  }) {
    const executionSettings = kernelFunction?.executionSettings ?? kernelArguments?.executionSettings;

    const services = this.getServicesByType(serviceType);

    if (!services.length) {
      return undefined;
    }

    if (!executionSettings || executionSettings.size === 0) {
      // return the first service if no execution settings are provided
      return {
        service: services[0],
        executionSettings: undefined,
      };
    }

    let defaultExecutionSettings: PromptExecutionSettings | undefined;

    // search by service id first
    for (const [serviceId, _executionSettings] of executionSettings) {
      if (!serviceId || serviceId === defaultServiceId) {
        defaultExecutionSettings = _executionSettings;
      }

      const service = services.find((s) => this.getServiceId(s) === serviceId);
      if (service) {
        return {
          service,
          executionSettings: _executionSettings,
        };
      }
    }

    // search by model id next
    for (const _executionSettings of executionSettings.values()) {
      const modelId = _executionSettings.modelId;
      const service = services.find((s) => getServiceModelId(s) === modelId);
      if (service) {
        return {
          service,
          executionSettings: _executionSettings,
        };
      }
    }

    // search by default service id last
    if (defaultExecutionSettings) {
      return {
        service: services[0],
        executionSettings: defaultExecutionSettings,
      };
    }

    return undefined;
  }

  private getServiceId(service: AIService) {
    return service.constructor.name;
  }

  private hasService(serviceKey: string) {
    return this.services.has(serviceKey);
  }

  private getServicesByType<T extends AIServiceType>(serviceType: T) {
    return Array.from(this.services.values()).filter((service) => service.serviceType === serviceType) as Array<
      ServiceMapping<T>
    >;
  }
}
