import {
  ChatMessageContent,
  FunctionCallContent,
  TextContent,
  assistantChatMessage,
  parseFunctionName,
} from '@semantic-kernel/abstractions';
import { ChatCompletion } from 'openai/resources';

export type OpenAIChatMessageContent = Extract<ChatMessageContent, { role: 'assistant' }>;

export const createOpenAIChatMessageContent = (
  chatCompletion: ChatCompletion,
  modelId: string
): OpenAIChatMessageContent => {
  const choice = chatCompletion.choices[0];
  // do we need to change the role to "tool" when there are tool_calls?
  const role = choice.message.role;
  const content = choice.message.content;
  const items: Array<TextContent | FunctionCallContent> = [];

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

      const functionCallContent: FunctionCallContent = {
        id: toolCall.id,
        functionName,
        pluginName,
        arguments: functionArguments,
      };

      items.push(functionCallContent);
    }
  }

  return {
    ...(assistantChatMessage({
      modelId,
      role,
      items,
    }) as OpenAIChatMessageContent),
  };
};

export const getOpenAIChatMessageContentToolCalls = (chatMessageContent: OpenAIChatMessageContent) => {
  const toolCalls: FunctionCallContent[] = [];

  for (const item of chatMessageContent.items) {
    const isFunctionCallContent = (item as FunctionCallContent).functionName !== undefined;

    if (isFunctionCallContent) {
      toolCalls.push(item as FunctionCallContent);
    }
  }

  return toolCalls;
};
