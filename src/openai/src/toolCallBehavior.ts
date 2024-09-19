import { Kernel } from '@semantic-kernel/abstractions';
import { ChatCompletionTool, ChatCompletionToolChoiceOption } from 'openai/resources';


/// Gets the separator used between the plugin name and the function name, if a plugin name is present.
/// <remarks>This separator was previously <c>_</c>, but has been changed to <c>-</c> to better align to the behavior elsewhere in SK and in response
/// to developers who want to use underscores in their function or plugin names. We plan to make this setting configurable in the future.</remarks>
const NameSeparator = '-';

const fullyQualifiedName = ({ functionName, pluginName }: { functionName: string; pluginName?: string }) =>
  !pluginName ? functionName : `${pluginName}${NameSeparator}${functionName}`;

// The default maximum number of tool-call auto-invokes that can be made in a single request.
export const DefaultMaximumAutoInvokeAttempts = 128;

// Gets how many requests are part of a single interaction should include this tool in the request.
export const DefaultMaximumUseAttempts = 2 ^ 32;

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
    tools: ChatCompletionTool[] | null;
    choice: ChatCompletionToolChoiceOption | null;
  };
};

/**
 * Represents a ToolCallBehavior that will provide to the model all available functions from a provided by the client.
 */
function kernelFunctions({ autoInvoke }: { autoInvoke: boolean }) {
  const toolCallBehavior: ToolCallBehavior = {
    MaximumAutoInvokeAttempts: autoInvoke ? DefaultMaximumAutoInvokeAttempts : 0,
    MaximumUseAttempts: DefaultMaximumUseAttempts,

    configureOptions: (kernel?: Kernel) => {
      let tools: ChatCompletionTool[] | null = null;
      let choice: ChatCompletionToolChoiceOption | null = null;

      if (kernel) {
        const functionsMetadata = kernel.plugins.getFunctionsMetadata();

        if (functionsMetadata.length > 0) {
          choice = 'auto';
          tools = [];

          for (const functionMetadata of functionsMetadata) {
            tools.push({
              type: 'function',
              function: {
                description: functionMetadata.description,
                name: fullyQualifiedName({
                  functionName: functionMetadata.name,
                  pluginName: functionMetadata.pluginName,
                }),
                parameters: functionMetadata.parameters,
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
}

export const AutoInvokeKernelFunctions = kernelFunctions({ autoInvoke: true });
