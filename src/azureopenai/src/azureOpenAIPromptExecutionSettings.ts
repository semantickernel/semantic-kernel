import { PromptExecutionSettings, defaultServiceId } from '@semantic-kernel/abstractions';
import { ResponseFormatJSONSchema } from 'openai/resources';

/**
 * Settings for executing a prompt using the Azure OpenAI API.
 */
export interface AzureOpenAIPromptExecutionSettings extends PromptExecutionSettings {
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  maxCompletionTokens?: number;
  responseFormat?:
    | {
        type: 'text';
      }
    | {
        type: 'json_object';
      }
    | {
        type: 'json_schema';
        json_schema: ResponseFormatJSONSchema.JSONSchema;
      };
  seed?: number;
  stop?: string | null | Array<string>;
  chatSystemPrompt?: string;
}

const defaultOpenAIPromptExecutionSettings: AzureOpenAIPromptExecutionSettings = {
  serviceId: defaultServiceId,
};

/**
 * Gets the Azure OpenAI prompt execution settings based on the provided {@link PromptExecutionSettings}.
 * @param executionSettings The prompt execution settings.
 * @returns The Azure OpenAI prompt execution settings.
 */
export const getOpenAIPromptExecutionSettings = (
  executionSettings?: PromptExecutionSettings
): AzureOpenAIPromptExecutionSettings => {
  return {
    ...defaultOpenAIPromptExecutionSettings,
    ...executionSettings,
  };
};
