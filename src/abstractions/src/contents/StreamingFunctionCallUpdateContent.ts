import { StreamingKernelContent } from './StreamingKernelContent';

export class StreamingFunctionCallUpdateContent extends StreamingKernelContent {
  public callId?: string;
  public name?: string;
  public arguments?: string;
  public functionCallIndex?: number;

  public constructor({
    callId,
    name,
    arguments: args,
    functionCallIndex,
  }: {
    callId?: string;
    name?: string;
    arguments?: string;
    functionCallIndex?: number;
  }) {
    super({ choiceIndex: functionCallIndex ?? 0 });
    this.callId = callId;
    this.name = name;
    this.arguments = args;
    this.functionCallIndex = functionCallIndex;
  }
}
