import { TextContent } from './TextContent';

describe('TextContent', () => {
  it('should be able to create a text content', () => {
    // Arrange
    const text = 'test';

    // Act
    const result = new TextContent({ text });

    // Assert
    expect(result).toEqual({
      text,
      encoding: 'utf-8',
    });
  });
});
