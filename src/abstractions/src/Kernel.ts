import { PromptExecutionSettings } from './AI';
import {
  FunctionInvocationFilter,
  FunctionResult,
  KernelFunction,
  KernelFunctionFromPrompt,
  KernelPlugin,
} from './functions';
import { FunctionInvocationContext } from './functions/FunctionInvocationContext';
import { KernelArguments } from './functions/KernelArguments';
import { KernelPlugins, MapKernelPlugins } from './functions/KernelPlugins';
import { PromptTemplateFormat } from './promptTemplate';
import { AIService, MapServiceProvider, ServiceProvider } from './services';

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

  public async onFunctionInvocation<Schema, Result, Args>({
    function: fn,
    arguments: args,
    functionResult,
    isStreaming,
    functionCallback,
  }: {
    function: KernelFunction<Schema, Result, Args>;
    arguments: KernelArguments<Schema, Args>;
    functionResult: FunctionResult<Schema, Result, Args>;
    isStreaming: boolean;
    functionCallback: (context: FunctionInvocationContext<Schema, Result, Args>) => Promise<void>;
  }) {
    const context = new FunctionInvocationContext<Schema, Result, Args>({
      isStreaming,
      kernel: this,
      function: fn,
      arguments: args,
      result: functionResult,
    });

    await Kernel.invokeFilterOrFunction<Schema, Result, Args>({
      functionFilters: this.functionInvocationFilters,
      functionCallback,
      context,
    });

    return context;
  }

  public static async invokeFilterOrFunction<Schema, Result, Args>({
    functionFilters,
    functionCallback,
    context,
    index,
  }: {
    functionFilters: Array<FunctionInvocationFilter>;
    functionCallback: (context: FunctionInvocationContext<Schema, Result, Args>) => Promise<void>;
    context: FunctionInvocationContext<Schema, Result, Args>;
    index?: number;
  }) {
    index = index ?? 0;

    if (functionFilters.length > 0 && index < functionFilters.length) {
      const functionFilter = functionFilters[index];
      await functionFilter.onFunctionInvocationFilter({
        context,
        next: async (context) =>
          await Kernel.invokeFilterOrFunction<Schema, Result, Args>({
            functionFilters,
            functionCallback,
            context,
            index: index + 1,
          }),
      });
    } else {
      await functionCallback(context);
    }
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
  public async invoke<Schema, Result, Args>({
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

  public invokeStreaming<Schema, Result, Args>({
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

    return kernelFunction.invokeStreaming(this, kernelArguments);
  }

  /**
   * Invokes a prompt.
   * @param params The parameters for the prompt.
   * @param params.promptTemplate The template for the prompt.
   * @param params.name The name of the kernel function (optional).
   * @param params.description The description of the kernel function (optional).
   * @param params.templateFormat The format of the template (optional).
   * @param params.inputVariables The input variables for the prompt (optional).
   * @param params.allowDangerouslySetContent Whether to allow dangerously set content (optional).
   * @param params.kernelArguments The KernelArguments to pass to the kernel function (optional).
   * @param params.arguments The arguments to pass to the kernel function (optional).
   * @param params.executionSettings The execution settings to pass to the kernel function (optional).
   * @returns The result of the prompt.
   */
  public async invokePrompt<Schema, Args>({
    promptTemplate,
    ...props
  }: {
    promptTemplate: string;
    name?: string;
    description?: string;
    templateFormat?: PromptTemplateFormat;
    inputVariables?: string[];
    allowDangerouslySetContent?: boolean;
    kernelArguments?: KernelArguments<Schema, Args>;
    arguments?: Args;
    executionSettings?: Map<string, PromptExecutionSettings> | PromptExecutionSettings[] | PromptExecutionSettings;
  }) {
    const kernelFunctionFromPrompt = KernelFunctionFromPrompt.create({
      promptTemplate,
      ...props,
    });

    return this.invoke({ kernelFunction: kernelFunctionFromPrompt, ...props });
  }

  /**
   * Invokes a streaming prompt.
   * @param params The parameters for the prompt.
   * @param params.promptTemplate The template for the prompt.
   * @param params.name The name of the kernel function (optional).
   * @param params.description The description of the kernel function (optional).
   * @param params.templateFormat The format of the template (optional).
   * @param params.inputVariables The input variables for the prompt (optional).
   * @param params.allowDangerouslySetContent Whether to allow dangerously set content (optional).
   * @param params.kernelArguments The KernelArguments to pass to the kernel function (optional).
   * @param params.arguments The arguments to pass to the kernel function (optional).
   * @param params.executionSettings The execution settings to pass to the kernel function (optional).
   * @returns The result of the prompt.
   */
  public invokeStreamingPrompt<Schema, Args>(props: {
    promptTemplate: string;
    name?: string;
    description?: string;
    templateFormat?: PromptTemplateFormat;
    inputVariables?: string[];
    allowDangerouslySetContent?: boolean;
    kernelArguments?: KernelArguments<Schema, Args>;
    arguments?: Args;
    executionSettings?: Map<string, PromptExecutionSettings> | PromptExecutionSettings[] | PromptExecutionSettings;
  }) {
    const kernelFunctionFromPrompt = KernelFunctionFromPrompt.create(props);

    return this.invokeStreaming({ kernelFunction: kernelFunctionFromPrompt, ...props });
  }
}

/**
 * Creates a new kernel.
 * @returns A new kernel.
 */
export const kernel = (): Kernel => new Kernel();
