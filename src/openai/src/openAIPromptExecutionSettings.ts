import { PromptExecutionSettings, defaultServiceId } from '@semantic-kernel/abstractions';
import { ResponseFormatJSONSchema } from 'openai/resources';

/**
 * Settings for executing a prompt using the OpenAI API.
 */
export interface OpenAIPromptExecutionSettings extends PromptExecutionSettings {
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  maxTokens?: number;
  maxCompletionTokens?: number;
  responseFormat?:
    | { type: 'text' }
    | { type: 'json_object' }
    | { type: 'json_schema'; json_schema: ResponseFormatJSONSchema.JSONSchema };
  seed?: number;
  stop?: string | null | Array<string>;
  /**
   * The system prompt to use when generating text using a chat model.
   * Defaults to "Assistant is a large language model."
   */
  chatSystemPrompt?: string;
}

const defaultOpenAIPromptExecutionSettings: OpenAIPromptExecutionSettings = {
  serviceId: defaultServiceId,
};

/**
 * Gets the OpenAI prompt execution settings based on the provided {@link PromptExecutionSettings}.
 * @param executionSettings The prompt execution settings.
 * @returns The OpenAI prompt execution settings.
 */
export const getOpenAIPromptExecutionSettings = (
  executionSettings?: PromptExecutionSettings
): OpenAIPromptExecutionSettings => {
  return {
    ...defaultOpenAIPromptExecutionSettings,
    ...executionSettings,
  };
};
