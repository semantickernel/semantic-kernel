import { ChatMessageContent, PromptExecutionSettings } from './AI';
import {
  FunctionInvocationFilter,
  FunctionResult,
  KernelFunction,
  PromptType,
  kernelFunctionFromPrompt,
} from './functions';
import { KernelPlugins, MapKernelPlugins } from './functions/KernelPlugins';
import { JsonSchema } from './jsonSchema';
import { AIService, ServiceProvider, getServiceProvider } from './services';
import { FromSchema } from 'json-schema-to-ts';

/**
 * Represents a kernel.
 */
export class Kernel {
  public functionInvocationFilters: FunctionInvocationFilter[] = [];
  public serviceProvider: ServiceProvider;
  public plugins: KernelPlugins;

  public constructor() {
    this.serviceProvider = getServiceProvider();
    this.plugins = new MapKernelPlugins();
  }

  public addService(service: AIService) {
    this.serviceProvider.addService(service);
    return this;
  }

  public invoke<Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>>(
    kernelFunction: KernelFunction<Props, Result, Parameters>,
    props: Props
  ) {
    return kernelFunction.invoke(this, props);
  }

  public invokePrompt({
    promptTemplate,
    executionSettings,
  }: {
    promptTemplate: string;
    executionSettings?: PromptExecutionSettings;
  }): FunctionResult<ChatMessageContent | ChatMessageContent[] | undefined, PromptType> {
    const fn = kernelFunctionFromPrompt({ promptTemplate, executionSettings });
    return fn.invoke(this, {});
  }
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export const kernel = (): Kernel => new Kernel();
