import { NameSeparator, fullyQualifiedName, parseFunctionName } from './functionName';

describe('functionName', () => {
  describe('parseFunctionName', () => {
    it('should be able to parse a function name without a plugin name', () => {
      // Arrange
      const fullyQualifiedName = 'test';

      // Act
      const result = parseFunctionName(fullyQualifiedName);

      // Assert
      expect(result).toEqual({
        functionName: fullyQualifiedName,
        pluginName: undefined,
      });
    });

    it('should be able to parse a function name with a plugin name', () => {
      // Arrange
      const fullyQualifiedName = 'plugin-test';

      // Act
      const result = parseFunctionName(fullyQualifiedName);

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
      const result = fullyQualifiedName({ functionName });

      // Assert
      expect(result).toEqual(functionName);
    });

    it('should be able to create a fully qualified name with a plugin name', () => {
      // Arrange
      const functionName = 'test';
      const pluginName = 'plugin';

      // Act
      const result = fullyQualifiedName({ functionName, pluginName });

      // Assert
      expect(result).toEqual(`${pluginName}${NameSeparator}${functionName}`);
    });
  });
});
