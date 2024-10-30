import { PromptExecutionSettings, defaultServiceId } from '../AI';
import { FromSchema, JsonSchema } from '../jsonSchema';

export class KernelArguments<
  Schema extends JsonSchema | unknown = unknown,
  Args = Schema extends JsonSchema ? FromSchema<Schema> : Record<string, object>,
> {
  public arguments: Args;
  private _executionSettings?: Map<string, PromptExecutionSettings>;

  public constructor({ args, executionSettings }: { args: Args; executionSettings?: PromptExecutionSettings[] }) {
    this.arguments = args;

    if (executionSettings) {
      const newExecutionSettings = new Map<string, PromptExecutionSettings>();

      for (const settings of executionSettings) {
        const targetServiceId = settings.serviceId ?? defaultServiceId;

        if (this.executionSettings?.has(targetServiceId)) {
          throw new Error(`Execution settings for service ID ${targetServiceId} already exists.`);
        }

        newExecutionSettings.set(targetServiceId, settings);
      }

      this.executionSettings = newExecutionSettings;
    }
  }

  public get executionSettings(): Map<string, PromptExecutionSettings> | undefined {
    return this._executionSettings;
  }

  public set executionSettings(settings: Map<string, PromptExecutionSettings>) {
    if (settings.size > 0) {
      for (const [key, setting] of settings.entries()) {
        if (setting.serviceId && key !== setting.serviceId) {
          throw new Error(`Service ID ${setting.serviceId} must match the key ${key}.`);
        }
      }
    }

    this._executionSettings = settings;
  }
}
