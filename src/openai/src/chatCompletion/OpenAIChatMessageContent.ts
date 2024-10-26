import { OpenAIFunctionNameSeparator } from '../OpenAIFunction';
import {
  ChatMessageContent,
  FunctionCallContent,
  TextContent,
  assistantChatMessage,
  functionCallContent,
  parseFunctionName,
  textContent,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export type OpenAIChatMessageContent = Extract<ChatMessageContent, { role: 'assistant' }>;

export const createOpenAIChatMessageContent = (
  chatCompletion: OpenAI.ChatCompletion,
  modelId: string
): OpenAIChatMessageContent => {
  const choice = chatCompletion.choices[0];
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
      const { functionName, pluginName } = parseFunctionName(toolCall.function.name, OpenAIFunctionNameSeparator);

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

  // OpenAI.ChatCompletion's role is always 'assistant'
  return {
    ...(assistantChatMessage({
      modelId,
      items,
    }) as OpenAIChatMessageContent),
  };
};

export const getOpenAIChatMessageContentToolCalls = (chatMessageContent: OpenAIChatMessageContent) => {
  return chatMessageContent.items.filter((item) => item.type === 'function');
};
