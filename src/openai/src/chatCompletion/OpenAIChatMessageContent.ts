import {
  ChatMessageContent,
  FunctionCallContent,
  TextContent,
  assistantChatMessage,
  functionCallContent,
  parseFunctionName,
  textContent,
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
    items.push(
      textContent({
        text: content,
      })
    );
  }

  if (choice.message.tool_calls) {
    for (const toolCall of choice.message.tool_calls) {
      // Only process function calls
      if (toolCall.type !== 'function') {
        continue;
      }

      const functionArguments = JSON.parse(toolCall.function.arguments);
      const { functionName, pluginName } = parseFunctionName(toolCall.function.name);

      items.push(
        functionCallContent({
          id: toolCall.id,
          functionName,
          pluginName,
          arguments: functionArguments,
        })
      );
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
  return chatMessageContent.items.filter((item) => item.type === 'function');
};
