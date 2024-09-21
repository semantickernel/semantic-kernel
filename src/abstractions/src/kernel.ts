import { ChatMessageContent, PromptExecutionSettings } from './AI';
import {
  FunctionInvocationFilter,
  FunctionResult,
  JsonSchema,
  KernelFunction,
  PromptType,
  kernelFunctionFromPrompt,
} from './functions';
import { KernelPlugins, kernelPlugins } from './functions/kernelPlugins';
import { AIService, ServiceProvider, getServiceProvider } from './services';
import { FromSchema } from 'json-schema-to-ts';

/**
 * Represents a kernel.
 */
export interface Kernel {
  functionInvocationFilters: FunctionInvocationFilter[];
  serviceProvider: ServiceProvider;
  plugins: KernelPlugins;

  /**
   * Adds a service to the kernel.
   * @param service The service to add.
   * @return The kernel.
   */
  addService(service: AIService): Kernel;
  invoke<Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>>(
    kernelFunction: KernelFunction<Props, Result, Parameters>,
    props: Props
  ): FunctionResult<Result, Props>;
  invokePrompt({
    promptTemplate,
  }: {
    promptTemplate: string;
    executionSettings?: PromptExecutionSettings;
  }): FunctionResult<ChatMessageContent | ChatMessageContent[] | undefined, PromptType>;
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export function kernel(): Kernel {
  const serviceProvider = getServiceProvider();
  const functionInvocationFilters: FunctionInvocationFilter[] = [];
  const plugins = kernelPlugins();

  return {
    functionInvocationFilters,
    serviceProvider,
    plugins,
    addService: function (service: AIService) {
      serviceProvider.addService(service);
      return this;
    },
    invoke: function (kernelFunction, props) {
      return kernelFunction.invoke(this, props);
    },
    invokePrompt: function ({
      promptTemplate,
      executionSettings,
    }: {
      promptTemplate: string;
      executionSettings?: PromptExecutionSettings;
    }) {
      const fn = kernelFunctionFromPrompt({ promptTemplate, executionSettings });
      return fn.invoke(this, {});
    },
  };
}
