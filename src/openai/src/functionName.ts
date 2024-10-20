import { fullyQualifiedName, parseFunctionName } from '@semantic-kernel/abstractions';

export const NameSeparator = '-';

export const openAIFullyQualifiedName = ({ functionName, pluginName }: { functionName: string; pluginName?: string }) =>
  fullyQualifiedName({ functionName, pluginName, nameSeparator: NameSeparator });

export const openAIParseFunctionName = (fullyQualifiedName: string) => {
  const { functionName, pluginName } = parseFunctionName(fullyQualifiedName, NameSeparator);

  return {
    functionName,
    pluginName,
  };
};
