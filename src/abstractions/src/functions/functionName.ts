/// Gets the separator used between the plugin name and the function name, if a plugin name is present.
/// <remarks>This separator was previously <c>_</c>, but has been changed to <c>-</c> to better align to the behavior elsewhere in SK and in response
/// to developers who want to use underscores in their function or plugin names. We plan to make this setting configurable in the future.</remarks>
const NameSeparator = '-';

export const parseFunctionName = (
  fullyQualifiedName: string,
  functionNameSeparator: string = NameSeparator
): {
  functionName: string;
  pluginName?: string;
} => {
  if (!fullyQualifiedName) {
    throw new Error('fullyQualifiedName is required');
  }

  if (fullyQualifiedName.indexOf(functionNameSeparator) !== -1) {
    const parts = fullyQualifiedName.split(functionNameSeparator);
    const functionName = parts[0].trim();
    const pluginName = parts[1].trim();

    return {
      functionName,
      pluginName,
    };
  }

  return {
    functionName: fullyQualifiedName,
    pluginName: undefined,
  };
};

export const fullyQualifiedName = ({ functionName, pluginName }: { functionName: string; pluginName?: string }) =>
  !pluginName ? functionName : `${pluginName}${NameSeparator}${functionName}`;
