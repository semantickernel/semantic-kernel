import { JsonSchema } from '../jsonSchema';
import { KernelFunction, KernelFunctionMetadata } from './kernelFunction';

type BaseKernelPlugin = {
  name: string;
  description: string;
};

/**
 * ArrayKernelPlugin represents a plugin that contains an array of functions.
 *This type is used in {@link KernelPlugins} to represent a plugin.
 */
type ArrayKernelPlugin = BaseKernelPlugin & {
  functions: Array<KernelFunction<unknown, unknown, JsonSchema, KernelFunctionMetadata<JsonSchema>>>;
};

export type KernelPlugin = ArrayKernelPlugin;

/**
 * MapKernelPlugin represents a plugin that contains a map of functions.
 * This type is the internal representation of a plugin in {@link KernelPlugins}.
 */
export type MapKernelPlugin = BaseKernelPlugin & {
  functions: Map<string, KernelFunction<unknown, unknown, JsonSchema, KernelFunctionMetadata<JsonSchema>>>;
};
