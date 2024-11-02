import { PromptExecutionSettings } from './AI';
import { FunctionInvocationFilter, KernelFunction, KernelFunctionFromPrompt, KernelPlugin } from './functions';
import { KernelArguments } from './functions/KernelArguments';
import { KernelPlugins, MapKernelPlugins } from './functions/KernelPlugins';
import { JsonSchema } from './jsonSchema';
import { AIService, MapServiceProvider, ServiceProvider } from './services';
import { FromSchema } from 'json-schema-to-ts';

/**
 * Represents a kernel.
 */
export class Kernel {
  private readonly _functionInvocationFilters: FunctionInvocationFilter[] = [];
  private readonly _serviceProvider: ServiceProvider;
  private readonly _plugins: KernelPlugins;

  /**
   * Creates a new kernel.
   */
  public constructor() {
    this._serviceProvider = new MapServiceProvider();
    this._plugins = new MapKernelPlugins();
  }

  /**
   * Gets the {@link KernelPlugins} instance.
   */
  public get plugins() {
    return this._plugins;
  }

  /**
   * Gets the {@link ServiceProvider} instance.
   */
  public get services() {
    return this._serviceProvider;
  }

  /**
   * Gets the function invocation filters for the kernel.
   */
  public get functionInvocationFilters() {
    return this._functionInvocationFilters;
  }

  /**
   * Adds a service to the kernel.
   * @param service The service to add.
   * @returns The kernel.
   */
  public addService(service: AIService) {
    this._serviceProvider.addService(service);
    return this;
  }

  /**
   * Adds a plugin to the kernel.
   * @param plugin The plugin to add.
   * @returns The kernel.
   */
  public addPlugin(plugin: KernelPlugin) {
    this._plugins.addPlugin(plugin);
    return this;
  }

  /**
   * Invokes a kernel function.
   * @param params The parameters for the kernel function.
   * @param params.kernelFunction The kernel function to invoke.
   * @param params.kernelArguments The KernelArguments to pass to the kernel function (optional).
   * @param params.arguments The arguments to pass to the kernel function (optional).
   * @param params.executionSettings The execution settings to pass to the kernel function (optional).
   * @returns The result of the kernel function.
   */
  public async invoke<Schema extends JsonSchema, Result, Args = FromSchema<Schema>>({
    kernelFunction,
    kernelArguments,
    ...props
  }: {
    kernelFunction: KernelFunction<Schema, Result, Args>;
    kernelArguments?: KernelArguments<Schema, Args>;
    arguments?: Args;
    executionSettings?: Map<string, PromptExecutionSettings> | PromptExecutionSettings[] | PromptExecutionSettings;
  }) {
    if (!kernelArguments) {
      kernelArguments = new KernelArguments(props);
    }

    return kernelFunction.invoke(this, kernelArguments);
  }

  /**
   * Invokes a prompt.
   * @param params The parameters for the prompt.
   * @param params.kernelArguments The KernelArguments to pass to the kernel function (optional).
   * @param params.arguments The arguments to pass to the kernel function (optional).
   * @param params.executionSettings The execution settings to pass to the kernel function (optional).
   * @returns The result of the prompt.
   */
  public async invokePrompt<Schema extends JsonSchema, Args = FromSchema<Schema>>({
    promptTemplate,
    ...props
  }: {
    promptTemplate: string;
    kernelArguments?: KernelArguments<Schema, Args>;
    arguments?: Args;
    executionSettings?: Map<string, PromptExecutionSettings> | PromptExecutionSettings[] | PromptExecutionSettings;
  }) {
    const fn = new KernelFunctionFromPrompt({
      promptTemplateConfig: {
        template: promptTemplate,
        templateFormat: 'string',
        inputVariables: [],
      },
    });

    return this.invoke({ kernelFunction: fn, ...props });
  }
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export const kernel = (): Kernel => new Kernel();
