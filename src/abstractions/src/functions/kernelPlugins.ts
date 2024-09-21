import { JsonSchema, KernelFunction, KernelFunctionMetadata } from './kernelFunction';
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
