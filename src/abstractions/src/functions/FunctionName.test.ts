import { FunctionName } from './FunctionName';

describe('FunctionName', () => {
  describe('parse', () => {
    it('should be able to parse a function name without a plugin name', () => {
      // Arrange
      const fullyQualifiedName = 'test';

      // Act
      const result = FunctionName.parse(fullyQualifiedName);

      // Assert
      expect(result).toEqual({
        functionName: fullyQualifiedName,
        pluginName: undefined,
      });
    });

    it('should be able to parse a function name with a plugin name and a custom NameSeparator', () => {
      // Arrange
      const fullyQualifiedName = 'plugin-test';

      // Act
      const result = FunctionName.parse(fullyQualifiedName, '-');

      // Assert
      expect(result).toEqual({
        functionName: 'test',
        pluginName: 'plugin',
      });
    });
  });

  describe('fullyQualifiedName', () => {
    it('should be able to create a fully qualified name without a plugin name', () => {
      // Arrange
      const functionName = 'test';

      // Act
      const result = FunctionName.fullyQualifiedName({ functionName });

      // Assert
      expect(result).toEqual(functionName);
    });

    it('should be able to create a fully qualified name with a plugin name', () => {
      // Arrange
      const functionName = 'test';
      const pluginName = 'plugin';

      // Act
      const result = FunctionName.fullyQualifiedName({ functionName, pluginName });

      // Assert
      expect(result).toEqual(`${pluginName}${FunctionName.NameSeparator}${functionName}`);
    });
  });
});
