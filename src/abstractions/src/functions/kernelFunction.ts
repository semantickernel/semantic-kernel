import { PromptExecutionSettings } from '../AI';
import { FromSchema, JsonSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { KernelArguments } from './KernelArguments';


export type Fn<Result, Props> = (props: Props) => Result;

export type FunctionResult<Result, Props> = {
  function?: Fn<Result, Props>;
  value: Result;
  renderedPrompt?: string;
  metadata?: ReadonlyMap<string, unknown>;
};

export type KernelFunctionProps<Props> = Props;

export type KernelFunctionMetadata<Parameters extends JsonSchema> = {
  name: string;
  description?: string;
  pluginName?: string;
  parameters: Parameters;
};

// export type KernelFunction<
//   Props,
//   Result,
//   Parameters extends JsonSchema,
//   Metadata = KernelFunctionMetadata<Parameters>,
// > = {
//   invoke: (kernel: Kernel, props: Props) => FunctionResult<Result, Props>;
//   metadata?: Metadata;
// };

export abstract class KernelFunction<Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>> {
  public readonly metadata: KernelFunctionMetadata<Parameters>;
  private readonly _executionSettings?: Map<string, PromptExecutionSettings>;

  constructor({
    metadata,
    executionSettings,
  }: {
    metadata: KernelFunctionMetadata<Parameters>;
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
    args?: KernelArguments<Parameters, Props>
  ): Promise<FunctionResult<Result, Props>>;

  invoke = async (kernel: Kernel, args?: KernelArguments<Parameters, Props>): Promise<FunctionResult<Result, Props>> => {
    const value = await this.invokeCore(kernel, args);

    kernel.functionInvocationFilters.forEach((filter) => {
      filter.onFunctionInvocationFilter({ kernel, args, value });
    });

    return value;
  };
}

// const abc = new KernelFunction(({ loc }) => loc, {
//   name: 'temperature',
//   description: 'Returns the temperature in a given city',
//   parameters: {
//     type: 'object',
//     properties: {
//       loc: { type: 'string', description: 'The location to return the temprature for' },
//     },
//     additionalProperties: false,
//   },
// });
// 
// abc.invoke(new Kernel(), { loc: 'Dublin' });

// export const kernelFunction = <Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>>(
//   fn: (props: Props) => Result,
//   metadata: KernelFunctionMetadata<Parameters>
// ): KernelFunction<Props, Result, Parameters> => {
//   const invoke = async (kernel: Kernel, props: Props): FunctionResult<Result, Props> => {
//     const value = await fn(props);
// 
//     kernel.functionInvocationFilters.forEach((filter) => {
//       filter.onFunctionInvocationFilter(kernel, fn, value);
//     });
// 
//     return {
//       function: fn,
//       value,
//     };
//   };
// 
//   return {
//     invoke,
//     metadata,
//   };
// };
