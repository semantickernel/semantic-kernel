import { getOpenAIChatMessageContentToolCalls } from '../../chatCompletion';
import { ChatMessageContent, fullyQualifiedName } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export const createChatCompletionMessages = (message: ChatMessageContent): OpenAI.Chat.ChatCompletionMessageParam[] => {
  // handle system messages
  if (message.role === 'system') {
    const chatSystemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: 'system',
      name: message.authorName,
      content: message.items.text,
    };

    return [chatSystemMessage];
  }

  // handle tool messages
  if (message.role === 'tool') {
    const toolCallId = (message.metadata ?? {})['tool_call_id'];

    if (!toolCallId || typeof toolCallId !== 'string') {
      throw new Error('Tool call ID is required for tool messages and must be a string.');
    }

    const chatToolMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
      role: 'tool',
      content: message.items.text,
      tool_call_id: toolCallId,
    };

    return [chatToolMessage];
  }

  // handle user messages
  if (message.role === 'user') {
    if (message.items.length === 1 && message.items[0].type === 'text') {
      const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
        role: 'user',
        content: message.items[0].text,
      };

      return [chatUserMessage];
    }

    for (const item of message.items) {
      if (item.type === 'text') {
        const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
          role: 'user',
          content: item.text,
        };

        return [chatUserMessage];
      } else if (item.type === 'image') {
        // TODO
      } else {
        throw new Error(`Unsupported chat item type: ${item.type}`);
      }
    }
  }

  // handle assistant messages
  if (message.role === 'assistant') {
    const messageToolCalls = getOpenAIChatMessageContentToolCalls(message);
    const chatAssistantMessage: OpenAI.Chat.ChatCompletionAssistantMessageParam = {
      role: 'assistant',
      name: message.authorName,
    };

    if (message.items.length === 1) {
      if (message.items[0].type === 'text') {
        chatAssistantMessage.content = message.items[0].text;
      }
    } else {
      chatAssistantMessage.content = message.items.filter((item) => item).filter((item) => item.type === 'text');
    }

    if (messageToolCalls.length > 0) {
      chatAssistantMessage.tool_calls = messageToolCalls.map((toolCall) => {
        if (!toolCall.id) {
          throw new Error(`ToolCall.Id is not defined for ${toolCall.functionName} in plugin ${toolCall.pluginName}`);
        }

        return {
          type: 'function',
          function: {
            name: fullyQualifiedName({
              functionName: toolCall.functionName,
              pluginName: toolCall.pluginName,
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
