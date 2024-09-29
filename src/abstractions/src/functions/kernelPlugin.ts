import { JsonSchema } from '../jsonSchema';
import { KernelFunction, KernelFunctionMetadata } from './kernelFunction';

export type KernelPlugin = {
  name: string;
  description: string;
  functions: {
    [functionName: string]: KernelFunction<unknown, unknown, JsonSchema>;
  };
};

/**
 * Gets a collection of KernelFunctionMetadata instances, one for every function in this plugin.
 */
export const getFunctionsMetadata = (plugin: KernelPlugin) => {
  return Object.values(plugin.functions)
    .filter((fn) => fn.metadata)
    .map((fn) => fn.metadata as KernelFunctionMetadata<JsonSchema>);
};
