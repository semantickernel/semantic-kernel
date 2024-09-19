import { ToolCallBehavior } from './toolCallBehavior';
import { PromptExecutionSettings, defaultServiceId } from '@semantic-kernel/abstractions';

export interface OpenAIPromptExecutionSettings extends PromptExecutionSettings {
  topP?: number;
  temperature?: number;
  /**
   * The system prompt to use when generating text using a chat model.
   * Defaults to "Assistant is a large language model."
   */
  chatSystemPrompt?: string;
  toolCallBehavior?: ToolCallBehavior;
}

const defaultOpenAIPromptExecutionSettings: OpenAIPromptExecutionSettings = {
  serviceId: defaultServiceId,
  topP: 1,
  temperature: 1,
};

export const getOpenAIPromptExecutionSettings = (
  executionSettings?: PromptExecutionSettings
): OpenAIPromptExecutionSettings => {
  return {
    ...defaultOpenAIPromptExecutionSettings,
    ...executionSettings,
  };
};
