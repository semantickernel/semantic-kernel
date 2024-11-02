import { JsonSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { KernelArguments } from './KernelArguments';
import { FunctionResult } from './kernelFunction';

export interface FunctionInvocationFilter {
  onFunctionInvocationFilter<Result, Props>(props: {
    kernel: Kernel;
    args?: KernelArguments<JsonSchema, Props>;
    value: FunctionResult<Result, Props>;
  }): void;
}
