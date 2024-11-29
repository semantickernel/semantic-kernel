import { FunctionInvocationContext } from './FunctionInvocationContext';

export interface FunctionInvocationFilter {
  onFunctionInvocationFilter<Schema, Result, Props>(props: {
    context: FunctionInvocationContext<Schema, Result, Props>;
    next: (context: FunctionInvocationContext<Schema, Result, Props>) => Promise<void>;
  }): Promise<void>;
}
