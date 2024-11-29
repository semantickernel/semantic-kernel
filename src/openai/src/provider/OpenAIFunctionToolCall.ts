import OpenAI from 'openai';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OpenAIFunctionToolCall {
  /**
   * Tracks tooling updates from streaming responses.
   * @param param0
   */
  public static TrackStreamingToolUpdate({
    updates,
    toolCallIdsByIndex,
    functionNamesByIndex,
    functionArgumentByIndex,
  }: {
    updates?: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[];
    toolCallIdsByIndex: Map<number, string>;
    functionNamesByIndex: Map<number, string>;
    functionArgumentByIndex: Map<number, string>;
  }) {
    if (!updates) {
      return;
    }

    for (const update of updates) {
      if (update.id) {
        toolCallIdsByIndex.set(update.index, update.id);
      }

      if (update.function?.name) {
        functionNamesByIndex.set(update.index, update.function?.name);
      }

      if (update.function?.arguments) {
        let existingArguments = functionArgumentByIndex.get(update.index);

        if (existingArguments) {
          existingArguments += update.function.arguments;
          functionArgumentByIndex.set(update.index, existingArguments);
        } else {
          functionArgumentByIndex.set(update.index, update.function?.arguments);
        }
      }
    }
  }

  /**
   * Converts the data built up by {@link TrackStreamingToolingUpdate} into an array of {@link typeof OpenAI.ChatCompletionMessageToolCall}s.
   * @param param0
   * @returns An array of {@link typeof OpenAI.ChatCompletionMessageToolCall}s
   */
  public static ConvertToolCallUpdatesToFunctionToolCalls({
    toolCallIdsByIndex,
    functionNamesByIndex,
    functionArgumentByIndex,
  }: {
    toolCallIdsByIndex: Map<number, string>;
    functionNamesByIndex: Map<number, string>;
    functionArgumentByIndex: Map<number, string>;
  }): Array<OpenAI.ChatCompletionMessageToolCall> {
    const toolCalls: Array<OpenAI.ChatCompletionMessageToolCall> = [];

    if (toolCallIdsByIndex.size > 0) {
      for (const [index, toolCallId] of toolCallIdsByIndex) {
        const functionName = functionNamesByIndex.get(index);
        const functionArguments = functionArgumentByIndex.get(index);

        toolCalls.push({
          id: toolCallId,
          type: 'function',
          function: {
            name: functionName ?? '',
            arguments: functionArguments ?? '',
          },
        });
      }
    }

    return toolCalls;
  }
}
