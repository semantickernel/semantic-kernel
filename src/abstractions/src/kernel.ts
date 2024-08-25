import { AIService } from './services/AIService';
import { getServiceProvider } from './services/serviceProvider';

/**
 * Represents a kernel.
 */
export interface Kernel {
  /**
   * Adds a service to the kernel.
   * @param service The service to add.
   * @return The kernel.
   */
  addService(service: AIService): Kernel;
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export function kernel(): Kernel {
  const serviceProvider = getServiceProvider();

  return {
    addService: function (service: AIService) {
      serviceProvider.addService(service);
      return this;
    },
  };
}
