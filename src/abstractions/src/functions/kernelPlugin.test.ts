import { kernelFunction } from './kernelFunction';
import { KernelPlugin } from './kernelPlugin';

const getMockPlugin = (): KernelPlugin => {
  return {
    name: 'testPlugin',
    description: 'testDescription',
    functions: [
      kernelFunction(() => 'testResult1', {
        name: 'testFunction1',
        parameters: {
          type: 'string',
        },
      }),
      kernelFunction(() => 'testResult2', {
        name: 'testFunction2',
        parameters: {
          type: 'number',
        },
      }),
    ],
  };
};

describe('kernelPlugin', () => {
  describe('getFunctionsMetadata', () => {
    it('should return all functions metadata', () => {
      // Arrange
      const mockPlugin = getMockPlugin();

      // Act
      const result = getFunctionsMetadata(mockPlugin);

      // Assert
      expect(result).toEqual([
        {
          name: 'testFunction1',
          parameters: {
            type: 'string',
          },
        },
        {
          name: 'testFunction2',
          parameters: {
            type: 'number',
          },
        },
      ]);
    });
  });
});
