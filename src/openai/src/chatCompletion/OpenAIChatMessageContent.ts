import {
  ChatMessageContent,
  FunctionCallContent,
  TextContent,
  chatMessage,
  parseFunctionName,
} from '@semantic-kernel/abstractions';
import { ChatCompletion } from 'openai/resources';

export type OpenAIChatMessageContent = ChatMessageContent;

export const createOpenAIChatMessageContent = (
  chatCompletion: ChatCompletion,
  modelId: string
): OpenAIChatMessageContent => {
  const choice = chatCompletion.choices[0];
  // do we need to change the role to "tool" when there are tool_calls?
  const role = choice.message.role;
  const content = choice.message.content;
  const items: (TextContent | FunctionCallContent<unknown>)[] = [];

  if (content) {
    const textContent: TextContent = {
      type: 'text',
      text: content,
    };

    items.push(textContent);
  }

  if (choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      // Only process function calls
      if (toolCall.type !== 'function') {
        continue;
      }

      const functionArguments = JSON.parse(toolCall.function.arguments);
      const { functionName, pluginName } = parseFunctionName(toolCall.function.name);

      const functionCallContent: FunctionCallContent<typeof functionArguments> = {
        id: toolCall.id,
        functionName,
        pluginName,
        arguments: functionArguments,
      };

      items.push(functionCallContent);
    }
  }

  return {
    ...chatMessage({
      modelId,
      role,
      items,
    }),
  };
};
