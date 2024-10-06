import { JsonSchema } from '../jsonSchema';
import { KernelFunction, KernelFunctionMetadata } from './kernelFunction';
import { KernelPlugin, MapKernelPlugin } from './kernelPlugin';

export type KernelPlugins = {
  addPlugin: (plugin: KernelPlugin) => KernelPlugins;
  getPlugins: () => Iterable<MapKernelPlugin>;
  getFunctionsMetadata: () => KernelFunctionMetadata<JsonSchema>[];
  getFunction: <Props, Result, Parameters extends JsonSchema>(
    functionName: string,
    pluginName?: string
  ) => KernelFunction<Props, Result, Parameters> | undefined;
};

/**
 * Creates a new instance of KernelPlugins.
 * The internal representation plugins is a map of plugin names to plugins.
 * @returns A new instance of KernelPlugins.
 */
export function kernelPlugins(): KernelPlugins {
  const plugins: Map<string, MapKernelPlugin> = new Map();

  return {
    addPlugin: function (plugin: KernelPlugin) {
      if (plugin.functions.length === 0) {
        throw new Error(`Plugin ${plugin.name} does not contain any functions`);
      }

      if (plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} has already been added`);
      }

      const mapPlugin: MapKernelPlugin = {
        ...plugin,
        functions: new Map(),
      };

      for (const pluginFunction of plugin.functions) {
        if (pluginFunction.metadata) {
          if (mapPlugin.functions.has(pluginFunction.metadata.name)) {
            throw new Error(`Function ${pluginFunction.metadata.name} has already been added to plugin ${plugin.name}`);
          }

          // Add the plugin name to the metadata of each function
          mapPlugin.functions.set(pluginFunction.metadata.name, {
            ...pluginFunction,
            metadata: { ...pluginFunction.metadata, pluginName: plugin.name },
          });
        }
      }

      plugins.set(plugin.name, mapPlugin);
      return this;
    },
    getPlugins: () => plugins.values(),
    /**
     * Gets a collection of KernelFunctionMetadata instances, one for every function in this plugin.
     */
    getFunctionsMetadata: () => {
      return Array.from(plugins.values()).flatMap((plugin) =>
        Array.from(plugin.functions.values())
          .filter((fn) => fn.metadata)
          .map((fn) => fn.metadata as KernelFunctionMetadata<JsonSchema>)
      );
    },
    getFunction: <Props, Result, Parameters extends JsonSchema>(functionName: string, pluginName?: string) => {
      if (pluginName) {
        // Search a specific plugin
        const plugin = plugins.get(pluginName);

        if (plugin) {
          const fn = plugin.functions.get(functionName) as KernelFunction<Props, Result, Parameters>;

          if (fn) {
            return fn;
          }
        }
      } else {
        // Search all plugins
        for (const plugin of plugins.values()) {
          const fn = plugin.functions.get(functionName) as KernelFunction<Props, Result, Parameters>;

          if (fn) {
            return fn;
          }
        }
      }

      return undefined;
    },
  };
}
