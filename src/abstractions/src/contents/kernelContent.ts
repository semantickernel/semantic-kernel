export type InnerContent = object;

export type ModelId = string;

export type KernelContent = {
  innerContent: InnerContent;
  modelId: ModelId;
  metadata: Map<string, object>;
};
