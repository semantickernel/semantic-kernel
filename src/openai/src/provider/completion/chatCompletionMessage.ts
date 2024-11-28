import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import {
  ChatMessageContent,
  FunctionCallContent,
  FunctionCallsProcessor,
  FunctionName,
  TextContent,
} from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export const createChatCompletionMessages = (message: ChatMessageContent): OpenAI.Chat.ChatCompletionMessageParam[] => {
  // handle system messages
  if (ChatMessageContent.isSystemMessage(message)) {
    const content = message.items[0].text;

    if (content) {
      const chatSystemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
        role: 'system',
        name: message.authorName,
        content,
      };

      return [chatSystemMessage];
    }
  }

  // handle tool messages
  if (ChatMessageContent.isToolMessage(message)) {
    const toolMessages: OpenAI.Chat.ChatCompletionToolMessageParam[] = [];

    for (const item of message.items) {
      const toolCallId = item.callId;

      if (!toolCallId || typeof toolCallId !== 'string') {
        throw new Error('Tool call ID is required for tool messages and must be a string.');
      }

      const content = FunctionCallsProcessor.processFunctionResult(item.result);

      toolMessages.push({
        role: 'tool',
        content,
        tool_call_id: toolCallId,
      });
    }

    if (toolMessages.length === 0) {
      throw new Error('No function result provided in the tool message.');
    }

    return toolMessages;
  }

  // handle user messages
  if (ChatMessageContent.isUserMessage(message)) {
    const items = message.items;

    if (items.length === 1 && message.content) {
      const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
        role: 'user',
        content: message.content,
      };

      return [chatUserMessage];
    }

    for (const item of items) {
      if (message.content) {
        const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
          role: 'user',
          content: message.content,
        };

        return [chatUserMessage];
      } else {
        throw new Error(`Unsupported chat item type: ${item}`);
      }
    }
  }

  // handle assistant messages
  if (message.role === 'assistant') {
    const items = (message as ChatMessageContent<'assistant'>).items;
    const messageToolCalls = FunctionCallContent.getFunctionCalls(message);

    const chatAssistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
      role: 'assistant',
      name: message.authorName,
    };

    if (items.length === 1) {
      if (items[0] instanceof TextContent) {
        chatAssistantMessage.content = items[0].text;
      }
    } else {
      const textContents = items
        .filter((item) => item)
        .filter((item) => item instanceof TextContent && item.text) as TextContent[];

      chatAssistantMessage.content = (textContents.map((item) => item.text) as string[]).map((text) => {
        return { text, type: 'text' };
      });
    }

    if (messageToolCalls.length > 0) {
      chatAssistantMessage.tool_calls = messageToolCalls.map((toolCall) => {
        if (!toolCall.id) {
          throw new Error(`ToolCall.Id is not defined for ${toolCall.functionName} in plugin ${toolCall.pluginName}`);
        }

        return {
          type: 'function',
          function: {
            name: FunctionName.fullyQualifiedName({
              functionName: toolCall.functionName,
              pluginName: toolCall.pluginName,
              nameSeparator: OpenAIFunctionNameSeparator,
            }),
            arguments: JSON.stringify(toolCall.arguments),
          },
          id: toolCall.id,
        };
      });
    }

    return [chatAssistantMessage];
  }

  throw new Error(`Unsupported chat message role: ${message.role}`);
};
