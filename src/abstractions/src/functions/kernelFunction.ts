import { PromptExecutionSettings } from '../AI';
import { FromSchema, JsonSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { KernelArguments } from './KernelArguments';

export type Fn<Result, Args> = (args?: Args, kernel?: Kernel) => Result;

export type FunctionResult<Result, Args> = {
  function?: Fn<Result, Args>;
  value: Result;
  renderedPrompt?: string;
  metadata?: ReadonlyMap<string, unknown>;
};

export type KernelFunctionProps<Props> = Props;

export type KernelFunctionMetadata<Parameters> = {
  name: string;
  description?: string;
  pluginName?: string;
  parameters: Parameters;
};

export abstract class KernelFunction<
  Schema extends JsonSchema | unknown = unknown,
  Result = unknown,
  Args = Schema extends JsonSchema ? FromSchema<Schema> : Record<string, object>,
> {
  public readonly metadata: KernelFunctionMetadata<Schema>;
  public readonly _executionSettings?: Map<string, PromptExecutionSettings>;

  constructor({
    metadata,
    executionSettings,
  }: {
    metadata: KernelFunctionMetadata<Schema>;
    executionSettings?: Map<string, PromptExecutionSettings>;
  }) {
    this.metadata = metadata;
    this._executionSettings = executionSettings;
  }

  public get executionSettings(): Map<string, PromptExecutionSettings> | undefined {
    return this._executionSettings;
  }

  protected abstract invokeCore(
    kernel: Kernel,
    args?: KernelArguments<Schema, Args>
  ): Promise<FunctionResult<Result, Args>>;

  invoke = async (kernel: Kernel, args?: KernelArguments<Schema, Args>): Promise<FunctionResult<Result, Args>> => {
    const value = await this.invokeCore(kernel, args);

    kernel.functionInvocationFilters.forEach((filter) => {
      filter.onFunctionInvocationFilter({ kernel, args, value });
    });

    return value;
  };
}

export const kernelFunction = <Schema extends JsonSchema, Result, Args = FromSchema<Schema>>(
  fn: Fn<Result, Args>,
  metadata: KernelFunctionMetadata<Schema>
): KernelFunction<Schema, Result, Args> => {
  return new (class extends KernelFunction<Schema, Result, Args> {
    constructor() {
      super({ metadata });
    }

    override async invokeCore(kernel: Kernel, args?: KernelArguments<Schema, Args>) {
      return {
        value: await fn(args?.arguments, kernel),
        function: fn,
      };
    }
  })();
};
