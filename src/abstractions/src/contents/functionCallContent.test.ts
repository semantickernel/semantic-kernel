import { FunctionCallContent } from './FunctionCallContent';

describe('functionCallContent', () => {
  it('should be able to create a function call content', () => {
    // Arrange
    const functionName = 'test';

    // Act
    const result = new FunctionCallContent({ functionName });

    // Assert
    expect(result).toEqual({
      functionName,
    });
  });

  it('should be able to create a function call content with arguments', () => {
    // Arrange
    const functionName = 'test';
    const args = { arg1: 'val1', arg2: 'val2' };

    // Act
    const result = new FunctionCallContent({ functionName, arguments: args });

    // Assert
    expect(result).toEqual({
      functionName,
      arguments: args,
    });
  });
});
