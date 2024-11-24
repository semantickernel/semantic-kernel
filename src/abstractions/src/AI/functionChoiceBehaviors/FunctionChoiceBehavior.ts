import { KernelFunction } from '../../functions';
import { AutoFunctionChoiceBehavior } from './AutoFunctionChoiceBehavior';
import { FunctionChoiceBehaviorOptions } from './FunctionChoiceBehaviorOptions';
import { NoneFunctionChoiceBehavior } from './NoneFunctionChoiceBehavior';

export class FunctionChoiceBehavior {
  static Auto(functions?: Array<KernelFunction>, autoInvoke: boolean = true, options?: FunctionChoiceBehaviorOptions) {
    return new AutoFunctionChoiceBehavior(functions, autoInvoke, options);
  }

  static None(functions?: Array<KernelFunction>, options?: FunctionChoiceBehaviorOptions) {
    return new NoneFunctionChoiceBehavior(functions, options);
  }
}
