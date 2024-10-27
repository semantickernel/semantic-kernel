import { ChatMessageContent, PromptExecutionSettings } from './AI';
import {
  FunctionInvocationFilter,
  FunctionResult,
  KernelFunction,
  KernelPlugin,
  PromptType,
  kernelFunctionFromPrompt,
} from './functions';
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
   * @param kernelFunction The kernel function to invoke.
   * @param props The properties to pass to the kernel function.
   * @returns The result of the kernel function.
   */
  public invoke<Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>>(
    kernelFunction: KernelFunction<Props, Result, Parameters>,
    props: Props
  ) {
    return kernelFunction.invoke(this, props);
  }

  /**
   * Invokes a prompt.
   * @param params The parameters for the prompt.
   * @param params.promptTemplate The prompt template.
   * @param params.executionSettings The execution settings for the prompt.
   * @returns The result of the prompt.
   */
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
