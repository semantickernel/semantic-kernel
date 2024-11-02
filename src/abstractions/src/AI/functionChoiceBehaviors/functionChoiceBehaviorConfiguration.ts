import { KernelFunction } from '../../functions';
import { FunctionChoice } from './functionChoice';

export interface FunctionChoiceBehaviorConfiguration {
  choice: FunctionChoice;
  autoInvoke: boolean;
  functions: Array<KernelFunction> | undefined;
}
