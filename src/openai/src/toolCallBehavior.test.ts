import {
  AutoInvokeKernelFunctions,
  DefaultMaximumAutoInvokeAttempts,
  DefaultMaximumUseAttempts,
} from './toolCallBehavior';
import { JsonSchema, KernelFunction, KernelPlugin, kernel, kernelFunction } from '@semantic-kernel/abstractions';

const getMockFunction = (functionName: string, functionDescription: string, functionParameters: JsonSchema) => {
  return kernelFunction(() => 'testResult', {
    name: functionName,
    description: functionDescription,
    parameters: functionParameters,
  });
};

const getMockPlugin = (pluginFunctions: KernelFunction<unknown, unknown, JsonSchema>[]): KernelPlugin => {
  return {
    name: 'testPlugin',
    description: 'testDescription',
    functions: pluginFunctions,
  };
};

describe('toolCallBehavior', () => {
  describe('AutoInvokeKernelFunctions', () => {
    it('should set the MaximumAutoInvokeAttempts to DefaultMaximumAutoInvokeAttempts by default', () => {
      // Arrange
      // Act
      const toolCallBehavior = AutoInvokeKernelFunctions;

      // Assert
      expect(toolCallBehavior.MaximumAutoInvokeAttempts).toBe(DefaultMaximumAutoInvokeAttempts);
    });

    it('should set the MaximumUseAttempts to DefaultMaximumUseAttempts by default', () => {
      // Arrange
      // Act
      const toolCallBehavior = AutoInvokeKernelFunctions;

      // Assert
      expect(toolCallBehavior.MaximumUseAttempts).toBe(DefaultMaximumUseAttempts);
    });

    it('should return null if no kernel is provided', () => {
      // Arrange
      // Act
      const toolCallBehavior = AutoInvokeKernelFunctions.configureOptions();

      // Assert
      expect(toolCallBehavior.choice).toBeNull();
      expect(toolCallBehavior.tools).toBeNull();
    });

    it('should return null if no functions are available', () => {
      // Arrange
      const mockKernel = kernel();

      // Act
      const toolCallBehavior = AutoInvokeKernelFunctions.configureOptions(mockKernel);

      // Assert
      expect(toolCallBehavior.choice).toBeNull();
      expect(toolCallBehavior.tools).toBeNull();
    });

    it('should return all available functions from a provided by the client', () => {
      // Arrange
      const mockKernel = kernel();

      mockKernel.plugins.addPlugin(
        getMockPlugin([
          getMockFunction('testFunction1', 'testDescription1', { type: 'string' }),
          getMockFunction('testFunction2', 'testDescription2', { type: 'number' }),
        ])
      );

      // Act
      const toolCallBehavior = AutoInvokeKernelFunctions.configureOptions(mockKernel);

      // Assert
      expect(toolCallBehavior.choice).toBe('auto');
      expect(toolCallBehavior.tools).toEqual([
        {
          function: {
            description: 'testDescription1',
            name: 'testPlugin-testFunction1',
            parameters: {
              type: 'string',
            },
          },
          type: 'function',
        },
        {
          function: {
            description: 'testDescription2',
            name: 'testPlugin-testFunction2',
            parameters: {
              type: 'number',
            },
          },
          type: 'function',
        },
      ]);
    });
  });
});
