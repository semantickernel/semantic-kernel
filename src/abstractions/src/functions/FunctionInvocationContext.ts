import { Kernel } from '../Kernel';
import { KernelArguments } from './KernelArguments';
import { FunctionResult, KernelFunction } from './KernelFunction';

export class FunctionInvocationContext<Schema, Result, Args> {
  isStreaming: boolean;
  kernel: Kernel;
  function: KernelFunction<Schema, Result, Args>;
  arguments: KernelArguments<Schema, Args>;
  result: FunctionResult<Schema, Result, Args>;

  constructor({
    isStreaming,
    kernel,
    function: fn,
    arguments: args,
    result,
  }: {
    isStreaming: boolean;
    kernel: Kernel;
    function: KernelFunction<Schema, Result, Args>;
    arguments: KernelArguments<Schema, Args>;
    result: FunctionResult<Schema, Result, Args>;
  }) {
    this.isStreaming = isStreaming;
    this.kernel = kernel;
    this.function = fn;
    this.arguments = args;
    this.result = result;
  }
}
