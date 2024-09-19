import { KernelFunctionMetadata } from './kernelFunction';
import { KernelPlugin, getFunctionsMetadata } from './kernelPlugin';

export type KernelPlugins = {
  addPlugin: (plugin: KernelPlugin) => KernelPlugins;
  getPlugins: () => KernelPlugin[];
  getFunctionsMetadata: () => KernelFunctionMetadata<unknown>[];
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
  };
}
