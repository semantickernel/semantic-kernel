/**
 * The separator used between the plugin name and the function name, if a plugin name is present.
 */
export const NameSeparator = '.';

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
    const pluginName = parts[0].trim();
    const functionName = parts[1].trim();

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

export const fullyQualifiedName = ({
  functionName,
  pluginName,
  nameSeparator,
}: {
  functionName: string;
  pluginName?: string;
  nameSeparator?: string;
}) => (!pluginName ? functionName : `${pluginName}${nameSeparator ?? NameSeparator}${functionName}`);
