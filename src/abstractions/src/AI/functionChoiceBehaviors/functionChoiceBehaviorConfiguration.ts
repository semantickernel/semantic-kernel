import { KernelFunction } from '../../functions';
import { JsonSchema } from '../../jsonSchema';
import { FunctionChoice } from './functionChoice';

export interface FunctionChoiceBehaviorConfiguration {
  choice: FunctionChoice;
  autoInvoke: boolean;
  functions: Array<KernelFunction<unknown, unknown, JsonSchema>> | undefined;
}
