import { JsonSchema } from '../jsonSchema';
import { KernelFunction, KernelFunctionMetadata } from './kernelFunction';
import { KernelPlugin, getFunctionsMetadata } from './kernelPlugin';

export type KernelPlugins = {
  addPlugin: (plugin: KernelPlugin) => KernelPlugins;
  getPlugins: () => KernelPlugin[];
  getFunctionsMetadata: () => KernelFunctionMetadata<JsonSchema>[];
  getFunction: <Props, Result, Parameters extends JsonSchema>(
    functionName: string,
    pluginName?: string
  ) => KernelFunction<Props, Result, Parameters> | undefined;
};

export function kernelPlugins(): KernelPlugins {
  const plugins: KernelPlugin[] = [];

  return {
    addPlugin: function (plugin: KernelPlugin) {
      if (Object.values(plugin.functions).length === 0) {
        throw new Error(`Plugin ${plugin.name} does not contain any functions`);
      }

      // Add the plugin name to the metadata of each function
      for (const pluginFunction of Object.values(plugin.functions)) {
        if (pluginFunction.metadata) {
          pluginFunction.metadata.pluginName = plugin.name;
        }
      }

      plugins.push(plugin);
      return this;
    },
    getPlugins: () => [...plugins],
    getFunctionsMetadata: () => {
      return plugins.flatMap((plugin) => getFunctionsMetadata(plugin));
    },
    getFunction: <Props, Result, Parameters extends JsonSchema>(functionName: string, pluginName?: string) => {
      if (pluginName) {
        const plugin = plugins.find((plugin) => plugin.name === pluginName);

        if (plugin) {
          const fn = plugin.functions[functionName] as KernelFunction<Props, Result, Parameters>;

          if (fn) {
            return fn;
          }
        }
      } else {
        for (const plugin of plugins) {
          const fn = plugin.functions[functionName] as KernelFunction<Props, Result, Parameters>;

          if (fn) {
            return fn;
          }
        }
      }

      return undefined;
    },
  };
}
