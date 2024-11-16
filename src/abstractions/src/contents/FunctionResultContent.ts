import { KernelContent } from './KernelContent';

export class FunctionResultContent<T> extends KernelContent {
  callId?: string;
  pluginName?: string;
  functionName?: string;
  result?: T;

  constructor(props: { callId?: string; pluginName?: string; functionName?: string; result?: T }) {
    super({});
    this.callId = props.callId;
    this.pluginName = props.pluginName;
    this.functionName = props.functionName;
    this.result = props.result;
  }
}
