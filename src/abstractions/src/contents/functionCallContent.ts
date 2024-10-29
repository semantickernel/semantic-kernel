import { ChatMessageContent } from '../AI';
import { KernelArguments } from '../functions/KernelArguments';
import { JsonSchema } from '../jsonSchema';
import { KernelContent } from './KernelContent';

export class FunctionCallContent extends KernelContent {
  public id?: string;
  public functionName: string;
  public pluginName?: string;
  public arguments?: KernelArguments<JsonSchema>;

  constructor(props: { id?: string; functionName: string; pluginName?: string; arguments?: KernelArguments<JsonSchema> }) {
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
