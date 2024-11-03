import { PromptExecutionSettings } from '../AI';
import { FromSchema, JsonSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { KernelArguments } from './KernelArguments';

export type Fn<Result, Args> = (args: Args, kernel?: Kernel) => Result;

export type FunctionResult<Result, Args> = {
  function?: Fn<Result, Args>;
  value: Result;
  renderedPrompt?: string;
  metadata?: ReadonlyMap<string, unknown>;
};

export type KernelFunctionProps<Props> = Props;

export type KernelFunctionMetadata<Schema extends JsonSchema | unknown> = {
  name: string;
  description?: string;
  pluginName?: string;
  schema?: Schema;
};

export abstract class KernelFunction<
  Schema extends JsonSchema | unknown | undefined = unknown,
  Result = unknown,
  Args = Schema extends JsonSchema ? FromSchema<Schema> : Schema extends undefined ? undefined : Record<string, object>,
> {
  private readonly _metadata: KernelFunctionMetadata<Schema>;
  private readonly _executionSettings?: Map<string, PromptExecutionSettings>;

  constructor({
    metadata,
    executionSettings,
  }: {
    metadata: KernelFunctionMetadata<Schema>;
    executionSettings?: Map<string, PromptExecutionSettings>;
  }) {
    this._metadata = metadata;
    this._executionSettings = executionSettings;
  }

  public get executionSettings(): Map<string, PromptExecutionSettings> | undefined {
    return this._executionSettings;
  }

  public get metadata(): KernelFunctionMetadata<Schema> {
    return this._metadata;
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

export const kernelFunction = <
  Schema extends JsonSchema | undefined = undefined,
  Result = unknown,
  Args = Schema extends JsonSchema ? FromSchema<Schema> : undefined,
>(
  fn: Fn<Result, Args>,
  metadata: KernelFunctionMetadata<Schema>
): KernelFunction<Schema, Result, Args> => {
  return new (class extends KernelFunction<Schema, Result, Args> {
    constructor() {
      super({ metadata });
    }

    override async invokeCore(
      kernel: Kernel,
      args: Args extends undefined ? KernelArguments<Schema, Args> | undefined : KernelArguments<Schema, Args>
    ) {
      return {
        value: await fn(args?.arguments as Args, kernel),
        function: fn,
      };
    }
  })();
};
