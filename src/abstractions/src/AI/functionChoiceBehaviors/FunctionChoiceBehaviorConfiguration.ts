import { KernelFunction } from '../../functions';
import { FunctionChoice } from './FunctionChoice';

export interface FunctionChoiceBehaviorConfiguration {
  choice: FunctionChoice;
  autoInvoke: boolean;
  functions: Array<KernelFunction> | undefined;
}
