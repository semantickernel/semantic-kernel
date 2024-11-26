import { FunctionInvocationContext } from './FunctionInvocationContext';

export interface FunctionInvocationFilter {
  onFunctionInvocationFilter<Result, Props>(props: {
    context: FunctionInvocationContext<Result, Props>;
    next: (context: FunctionInvocationContext<Result, Props>) => Promise<void>;
  }): Promise<void>;
}
