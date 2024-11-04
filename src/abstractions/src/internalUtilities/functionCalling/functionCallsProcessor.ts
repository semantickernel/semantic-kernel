import { ChatHistory, ChatMessageContent } from '../../AI/ChatCompletion';
import { FunctionChoiceBehavior } from '../../AI/FunctionChoiceBehaviors/FunctionChoiceBehavior';
import { FunctionChoiceBehaviorConfiguration } from '../../AI/FunctionChoiceBehaviors/FunctionChoiceBehaviorConfiguration';
import { FunctionCallContent, FunctionResultContent } from '../../contents';
import { Kernel } from '../../kernel';

/**
 * The maximum number of function auto-invokes that can be made in a single user request.
 */
const MaximumAutoInvokeAttempts = 128;

export class FunctionCallsProcessor {
  public GetConfiguration(
    chatHistory: ChatHistory,
    requestIndex: number,
    behavior?: FunctionChoiceBehavior,
    kernel?: Kernel
  ): FunctionChoiceBehaviorConfiguration | undefined {
    if (!behavior) {
      return undefined;
    }

    const configuration = behavior.getConfiguredOptions({ requestSequenceIndex: requestIndex, chatHistory, kernel });

    configuration.autoInvoke = kernel !== undefined && configuration.autoInvoke;

    const maximumAutoInvokeAttempts = configuration.autoInvoke ? MaximumAutoInvokeAttempts : 0;

    if (requestIndex >= maximumAutoInvokeAttempts) {
      configuration.autoInvoke = false;
    }

    return configuration;
  }

  public async ProcessFunctionCalls({
    chatMessageContent,
    chatHistory,
    checkIfFunctionAdvertised,
    kernel,
  }: {
    chatMessageContent: ChatMessageContent;
    chatHistory: ChatHistory;
    requestIndex: number;
    checkIfFunctionAdvertised: (functionCallContent: FunctionCallContent) => boolean;
    kernel?: Kernel;
  }): Promise<ChatMessageContent | undefined> {
    const functionCalls = FunctionCallContent.getFunctionCalls(chatMessageContent);

    if (!functionCalls) {
      return undefined;
    }

    if (!kernel) {
      throw new Error('Kernel is required to process function calls.');
    }

    chatHistory.push(chatMessageContent);

    for (let functionCallIndex = 0; functionCallIndex < functionCalls?.length; functionCallIndex++) {
      const functionCall = functionCalls[functionCallIndex];

      if (!checkIfFunctionAdvertised(functionCall)) {
        this.addFunctionCallToChatHistory({
          chatHistory,
          functionCall,
          result: undefined,
          errorMessage: `Function call request for a function ${functionCall.functionName} that was not defined.`,
        });
        continue;
      }

      const kernelFunction = kernel?.plugins.getFunction(functionCall.functionName, functionCall.pluginName);

      if (!kernelFunction) {
        this.addFunctionCallToChatHistory({
          chatHistory,
          functionCall,
          result: undefined,
          errorMessage: `The specified function ${functionCall.functionName} is not available in the kernel.`,
        });
        continue;
      }

      try {
        const functionResult = await kernelFunction.invoke(kernel, functionCall.arguments);
        const functionResultValue = this.processFunctionResult(functionResult?.value ?? '');
        this.addFunctionCallToChatHistory({ chatHistory, functionCall, result: functionResultValue });
      } catch (e) {
        this.addFunctionCallToChatHistory({
          chatHistory,
          functionCall,
          result: undefined,
          errorMessage: `Error while invoking function: ${e.message}`,
        });
        continue;
      }

      // TODO: Handle the case where the function call is terminated early and return the last result.
    }
  }

  private addFunctionCallToChatHistory({
    chatHistory,
    functionCall,
    result,
    errorMessage,
  }: {
    chatHistory: ChatHistory;
    functionCall: FunctionCallContent;
    result?: string;
    errorMessage?: string;
  }) {
    result = result ?? errorMessage ?? '';

    const message = new ChatMessageContent<'tool'>({
      role: 'tool',
      items: new FunctionResultContent({
        callId: functionCall.id,
        result,
        functionName: functionCall.functionName,
        pluginName: functionCall.pluginName,
      }),
    });

    chatHistory.push(message);
  }

  private processFunctionResult(functionResult: unknown) {
    if (typeof functionResult === 'string') {
      return functionResult;
    }

    return JSON.stringify(functionResult);
  }
}
