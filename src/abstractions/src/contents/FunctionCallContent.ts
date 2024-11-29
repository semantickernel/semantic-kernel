import { KernelArguments } from '../functions/KernelArguments';
import { ChatMessageContent } from './ChatMessageContent';
import { KernelContent } from './KernelContent';

export class FunctionCallContent extends KernelContent {
  public id?: string;
  public functionName: string;
  public pluginName?: string;
  public arguments?: KernelArguments;

  constructor({
    id,
    functionName,
    pluginName,
    arguments: args,
    ...props
  }: { id?: string; functionName: string; pluginName?: string; arguments?: KernelArguments } & KernelContent) {
    super(props);
    this.id = id;
    this.functionName = functionName;
    this.pluginName = pluginName;
    this.arguments = args;
  }

  static getFunctionCalls(chatMessageContent: ChatMessageContent) {
    if (chatMessageContent.items instanceof Array) {
      return chatMessageContent.items.filter((item) => item instanceof FunctionCallContent) as FunctionCallContent[];
    }

    return [];
  }
}
