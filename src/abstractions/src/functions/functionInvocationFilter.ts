import { Kernel } from '../kernel';
import { Fn } from './kernelFunction';

export interface FunctionInvocationFilter {
  onFunctionInvocationFilter<Result, Props>(kernel: Kernel, fn: Fn<Result, Props>, value: Result): void;
}
