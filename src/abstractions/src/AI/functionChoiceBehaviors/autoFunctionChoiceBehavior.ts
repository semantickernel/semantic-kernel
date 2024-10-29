import { KernelFunction, fullyQualifiedName } from '../../functions';
import { JsonSchema } from '../../jsonSchema';
import { Kernel } from '../../kernel';
import { FunctionChoiceBehavior } from './functionChoiceBehavior';
import { FunctionChoiceBehaviorConfiguration } from './functionChoiceBehaviorConfiguration';

export class AutoFunctionChoiceBehavior extends FunctionChoiceBehavior {
  private readonly autoInvoke: boolean;
  public readonly functions: Array<string> | undefined;

  constructor(functions?: Array<KernelFunction<JsonSchema, unknown>>, autoInvoke: boolean = true) {
    super(functions);
    this.functions = functions
      ?.map(
        (f) => f.metadata && fullyQualifiedName({ functionName: f.metadata.name, pluginName: f.metadata.pluginName })
      )
      .filter((fqn) => fqn) as Array<string>;
    this.autoInvoke = autoInvoke;
  }

  override getConfiguredOptions({ kernel }: { kernel?: Kernel }): FunctionChoiceBehaviorConfiguration {
    const functions = this.getFunctions(this.functions, kernel, this.autoInvoke);

    return {
      choice: 'auto',
      autoInvoke: this.autoInvoke,
      functions,
    };
  }
}
