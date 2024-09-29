import { functionCallContent } from './functionCallContent';

describe('functionCallContent', () => {
  it('should be able to create a function call content', () => {
    // Arrange
    const functionName = 'test';

    // Act
    const result = functionCallContent({ functionName });

    // Assert
    expect(result).toEqual({
      type: 'function',
      functionName,
    });
  });

  it('should be able to create a function call content with arguments', () => {
    // Arrange
    const functionName = 'test';
    const args = { arg1: 'val1', arg2: 'val2' };

    // Act
    const result = functionCallContent({ functionName, arguments: args });

    // Assert
    expect(result).toEqual({
      type: 'function',
      functionName,
      arguments: args,
    });
  });
});
