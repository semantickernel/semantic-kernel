import { OpenAIPromptExecutionSettings } from '../../openAIPromptExecutionSettings';
import { Kernel } from '@semantic-kernel/abstractions';
import { ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources';

/**
 * Get the tool calling configuration for the current request.
 * @param requestIndex Request index.
 * @param kernel Kernel instance.
 * @param executionSettings Prompt execution settings.
 * @returns The tool calling configuration.
 */
export const getToolCallingConfig = (
  requestIndex: number,
  kernel?: Kernel,
  executionSettings?: OpenAIPromptExecutionSettings
): {
  tools: ChatCompletionTool[] | undefined;
  choice: ChatCompletionToolChoiceOption | undefined;
  autoInvoke: boolean;
} => {
  if (!executionSettings || !executionSettings.toolCallBehavior) {
    return {
      tools: undefined,
      choice: undefined,
      autoInvoke: false,
    };
  }

  if (requestIndex >= executionSettings.toolCallBehavior.MaximumUseAttempts) {
    return {
      tools: [],
      choice: 'none',
      autoInvoke: false,
    };
  }

  const { tools, choice } = executionSettings.toolCallBehavior.configureOptions(kernel);

  const autoInvoke = kernel !== undefined && executionSettings.toolCallBehavior.MaximumAutoInvokeAttempts > 0;

  return {
    tools: tools ?? [],
    choice: choice ?? 'none',
    autoInvoke,
  };
};
