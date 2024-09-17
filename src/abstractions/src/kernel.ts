import { FunctionInvocationFilter } from './functions/functionInvocationFilter';
import { FunctionResult, KernelFunction } from './functions/kernelFunction';
import { AIService } from './services/AIService';
import { getServiceProvider } from './services/serviceProvider';

/**
 * Represents a kernel.
 */
export interface Kernel {
  functionInvocationFilters: FunctionInvocationFilter[];

  /**
   * Adds a service to the kernel.
   * @param service The service to add.
   * @return The kernel.
   */
  addService(service: AIService): Kernel;
  invoke<Result, Props>(kernelFunction: KernelFunction<Result, Props>, props: Props): FunctionResult<Result, Props>;
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export function kernel(): Kernel {
  const serviceProvider = getServiceProvider();
  const functionInvocationFilters: FunctionInvocationFilter[] = [];

  return {
    functionInvocationFilters,
    addService: function (service: AIService) {
      serviceProvider.addService(service);
      return this;
    },
    invoke: function <Result, Props>(kernelFunction: KernelFunction<Result, Props>, props: Props) {
      return kernelFunction.invoke(this, props);
    },
  };
}
