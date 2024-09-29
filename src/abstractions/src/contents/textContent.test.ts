import { textContent } from './textContent';

describe('textContent', () => {
  it('should be able to create a text content', () => {
    // Arrange
    const text = 'test';

    // Act
    const result = textContent({ text });

    // Assert
    expect(result).toEqual({
      text,
      encoding: 'utf-8',
      type: 'text',
    });
  });
});
