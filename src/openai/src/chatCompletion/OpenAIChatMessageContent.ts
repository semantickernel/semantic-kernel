import { OpenAIFunctionNameSeparator } from '../OpenAIFunction';
import { ChatMessageContent, FunctionCallContent, FunctionName, TextContent } from '@semantic-kernel/abstractions';
import { KernelArguments } from '@semantic-kernel/abstractions';
import OpenAI from 'openai';

export class OpenAIChatMessageContent extends ChatMessageContent<'assistant'> {
  public constructor(props: { chatCompletion: OpenAI.ChatCompletion; model: string }) {
    const choice = props.chatCompletion.choices[0];
    const content = choice.message.content;
    const items: Array<TextContent | FunctionCallContent> = [];

    if (content) {
      items.push(
        new TextContent({
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
        const { functionName, pluginName } = FunctionName.parse(toolCall.function.name, OpenAIFunctionNameSeparator);

        items.push(
          new FunctionCallContent({
            id: toolCall.id,
            functionName,
            pluginName,
            arguments: new KernelArguments({ arguments: functionArguments }),
          })
        );
      }
    }

    // OpenAI.ChatCompletion's role is always 'assistant'
    super({
      role: 'assistant',
      model: props.model,
      items,
    });
  }
}
