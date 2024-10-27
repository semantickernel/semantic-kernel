import { ChatMessageContent } from '../AI';
import { KernelContent } from './KernelContent';

export class FunctionCallContent extends KernelContent {
  public id?: string;
  public functionName: string;
  public pluginName?: string;
  public arguments?: Record<string, unknown>;

  constructor(props: { id?: string; functionName: string; pluginName?: string; arguments?: Record<string, unknown> }) {
    super();
    this.id = props.id;
    this.functionName = props.functionName;
    this.pluginName = props.pluginName;
    this.arguments = props.arguments;
  }

  static getFunctionCalls(chatMessageContent: ChatMessageContent) {
    if (chatMessageContent.items instanceof Array) {
      return chatMessageContent.items.filter((item) => item instanceof FunctionCallContent) as FunctionCallContent[];
    }

    return [];
  }
}
