import { Kernel } from '../Kernel';
import { JsonSchema } from '../jsonSchema';
import { KernelArguments } from './KernelArguments';
import { FunctionResult } from './KernelFunction';

export interface FunctionInvocationFilter {
  onFunctionInvocationFilter<Result, Props>(props: {
    kernel: Kernel;
    args?: KernelArguments<JsonSchema, Props>;
    value: FunctionResult<Result, Props>;
  }): void;
}
