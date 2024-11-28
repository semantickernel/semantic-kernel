import { OpenAIFunctionNameSeparator } from '../../OpenAIFunction';
import { ChatMessageContent, FunctionCallContent, FunctionName, TextContent } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';


export const createChatCompletionMessages = (message: ChatMessageContent): OpenAI.Chat.ChatCompletionMessageParam[] => {
  // handle system messages
  if (message.role === 'system') {
    const chatSystemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: 'system',
      name: message.authorName,
      content: (message as ChatMessageContent<'system'>).items[0].text ?? '',
    };

    return [chatSystemMessage];
  }

  // handle tool messages
  if (message.role === 'tool') {
    const items = (message as ChatMessageContent<'tool'>).items[0];
    const toolCallId = items.callId;

    if (!toolCallId || typeof toolCallId !== 'string') {
      throw new Error('Tool call ID is required for tool messages and must be a string.');
    }

    let content = '';

    if (items.result) {
      if (typeof items.result === 'string') {
        content = items.result;
      }

      // TODO: handle the case Array<string> for message.items.result
    }

    const chatToolMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
      role: 'tool',
      content,
      tool_call_id: toolCallId,
    };

    return [chatToolMessage];
  }

  // handle user messages
  if (message.role === 'user') {
    const items = (message as ChatMessageContent<'user'>).items;

    if (items.length === 1 && items[0] instanceof TextContent && items[0].text) {
      const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
        role: 'user',
        content: items[0].text,
      };

      return [chatUserMessage];
    }

    for (const item of items) {
      if (item instanceof TextContent && item.text) {
        const chatUserMessage: OpenAI.Chat.ChatCompletionUserMessageParam = {
          role: 'user',
          content: item.text,
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
