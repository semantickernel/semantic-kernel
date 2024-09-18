import { Kernel } from '../kernel';

export type Fn<Result, Props> = (props: Props) => Result;

export type FunctionResult<Result, Props> = Promise<{
  function?: Fn<Result, Props>;
  value: Result;
  renderedPrompt?: string;
  metadata?: ReadonlyMap<string, unknown>;
}>;

export type KernelFunctionDescriptor = {
  describe: string;
};

export type KernelFunctionProps<Props> = { [Key in keyof Props]: KernelFunctionDescriptor };

export type KernelFunctionMetadata<Props> = KernelFunctionDescriptor & {
  parameters: KernelFunctionProps<Props>;
};

export type KernelFunction<Result, Props> = {
  invoke: (kernel: Kernel, props: Props) => FunctionResult<Result, Props>;
  metadata?: KernelFunctionMetadata<Props>;
};

export const kernelFunction = <Result, Props>(
  fn: Fn<Result, Props>,
  metadata: KernelFunctionMetadata<Props>
): KernelFunction<Result, Props> => {
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
