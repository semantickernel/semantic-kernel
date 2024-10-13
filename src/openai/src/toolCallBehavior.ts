import { Kernel, fullyQualifiedName } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

// The default maximum number of tool-call auto-invokes that can be made in a single request.
export const DefaultMaximumAutoInvokeAttempts = 128;

// Gets how many requests are part of a single interaction should include this tool in the request.
export const DefaultMaximumUseAttempts = 2 ** 32;

/**
 * Represents a ToolCallBehavior for OpenAI tool calls.
 */
export type ToolCallBehavior = {
  /**
   * Gets how many tool call request/response roundtrips are supported with auto-invocation.
   * To disable auto invocation, this can be set to 0.
   */
  MaximumAutoInvokeAttempts: number;

  /**
   * Gets how many requests are part of a single interaction should include this tool in the request.
   */
  MaximumUseAttempts: number;

  /**
   * Configures the options for the tool call behavior.
   * @param kernel Kernel instance
   * @returns
   */
  configureOptions: (kernel?: Kernel) => {
    tools: OpenAI.ChatCompletionTool[] | null;
    choice: OpenAI.ChatCompletionToolChoiceOption | null;
  };
};

/**
 * Represents a ToolCallBehavior that will provide to the model all available functions from a provided by the client.
 */
const kernelFunctions = ({ autoInvoke }: { autoInvoke: boolean }) => {
  const toolCallBehavior: ToolCallBehavior = {
    MaximumAutoInvokeAttempts: autoInvoke ? DefaultMaximumAutoInvokeAttempts : 0,
    MaximumUseAttempts: DefaultMaximumUseAttempts,

    configureOptions: (kernel?: Kernel) => {
      let tools: OpenAI.ChatCompletionTool[] | null = null;
      let choice: OpenAI.ChatCompletionToolChoiceOption | null = null;

      if (kernel) {
        const functionsMetadata = kernel.plugins.getFunctionsMetadata();

        if (functionsMetadata.length > 0) {
          choice = 'auto';
          tools = [];

          for (const { description, name: functionName, pluginName, parameters } of functionsMetadata) {
            if (typeof parameters !== 'object') {
              continue;
            }

            tools.push({
              type: 'function',
              function: {
                description,
                name: fullyQualifiedName({
                  functionName,
                  pluginName,
                }),
                parameters,
              },
            });
          }
        }
      }

      return {
        tools,
        choice,
      };
    },
  };

  return toolCallBehavior;
};

/**
 * Gets an instance that will both provide all of the {@link Kernel} plugins' function information
 * to the model and attempt to automatically handle any function call requests.
 */
export const AutoInvokeKernelFunctions = kernelFunctions({ autoInvoke: true });

// TODO: Add EnableFunctions and RequireFunctions tool call behaviors.
