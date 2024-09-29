import { FromSchema, JsonSchema } from '../jsonSchema';
import { Kernel } from '../kernel';

export type Fn<Result, Props> = (props: Props) => Result;

export type FunctionResult<Result, Props> = Promise<{
  function?: Fn<Result, Props>;
  value: Result;
  renderedPrompt?: string;
  metadata?: ReadonlyMap<string, unknown>;
}>;

export type KernelFunctionProps<Props> = Props;

export type KernelFunctionMetadata<Parameters extends JsonSchema> = {
  name: string;
  description?: string;
  pluginName?: string;
  parameters: Parameters;
};

export type KernelFunction<Props, Result, Parameters extends JsonSchema> = {
  invoke: (kernel: Kernel, props: Props) => FunctionResult<Result, Props>;
  metadata?: KernelFunctionMetadata<Parameters>;
};

export const kernelFunction = <Parameters extends JsonSchema, Result, Props = FromSchema<Parameters>>(
  fn: (props: Props) => Result,
  metadata: KernelFunctionMetadata<Parameters>
): KernelFunction<Props, Result, Parameters> => {
  const invoke = async (kernel: Kernel, props: Props): FunctionResult<Result, Props> => {
    const value = await fn(props);

    kernel.functionInvocationFilters.forEach((filter) => {
      filter.onFunctionInvocationFilter(kernel, fn, value);
    });

    return {
      function: fn,
      value,
    };
  };

  return {
    invoke,
    metadata,
  };
};
