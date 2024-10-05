import { JsonSchema } from '../jsonSchema';
import { KernelFunction, kernelFunction } from './kernelFunction';
import { KernelPlugin } from './kernelPlugin';
import { kernelPlugins } from './kernelPlugins';

const getMockFunction = (functionName?: string, functionDescription?: string, functionParameters?: JsonSchema) => {
  return kernelFunction(() => 'testResult', {
    name: functionName ?? 'testFunction',
    description: functionDescription ?? 'testDescription',
    parameters: functionParameters ?? {},
  });
};

const getMockPlugin = (
  pluginFunctions: { [functionName: string]: KernelFunction<unknown, unknown, JsonSchema> },
  pluginName?: string,
  pluginDescription?: string
): KernelPlugin => {
  return {
    name: pluginName ?? 'testPlugin',
    description: pluginDescription ?? 'testDescription',
    functions: pluginFunctions,
  };
};

const getMockKernelPlugins = () => {
  return kernelPlugins();
};

describe('kernelPlugins', () => {
  describe('kernelPlugins', () => {
    it('should return an object with the correct properties', () => {
      // Arrange
      // Act
      const result = kernelPlugins();

      // Assert
      expect(result.getPlugins()).toEqual([]);
    });
  });

  describe('addPlugin', () => {
    it('should add a plugin', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      mockKernelPlugins.addPlugin(
        getMockPlugin({
          testFunction1: getMockFunction('testFunction1'),
          testFunction2: getMockFunction('testFunction2'),
        })
      );

      // Assert
      expect(mockKernelPlugins.getPlugins()).toHaveLength(1);
      expect(mockKernelPlugins.getPlugins()[0].name).toEqual('testPlugin');
    });

    it('should add a plugin with correct functions', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      mockKernelPlugins.addPlugin(
        getMockPlugin({
          testFunction1: getMockFunction('testFunction1', 'testDescription1', { type: 'string' }),
          testFunction2: getMockFunction('testFunction2', 'testDescription2', { type: 'number' }),
        })
      );

      // Assert
      const firstPlugin = mockKernelPlugins.getPlugins()[0];
      expect(Object.values(firstPlugin.functions)).toHaveLength(2);
      expect(firstPlugin.functions['testFunction1'].metadata).toStrictEqual({
        name: 'testFunction1',
        description: 'testDescription1',
        pluginName: 'testPlugin',
        parameters: { type: 'string' },
      });
      expect(firstPlugin.functions['testFunction2'].metadata).toStrictEqual({
        name: 'testFunction2',
        description: 'testDescription2',
        pluginName: 'testPlugin',
        parameters: { type: 'number' },
      });
    });

    it('should not add plugin without functions', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      // Assert
      expect(() => {
        mockKernelPlugins.addPlugin(getMockPlugin({}, 'testPlugin'));
      }).toThrow();
    });

    it('should not add the same plugin twice', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      // Assert
      mockKernelPlugins.addPlugin(
        getMockPlugin(
          {
            testFunction2: getMockFunction('testFunction2', 'testDescription2', { type: 'number' }),
          },
          'testPlugin'
        )
      );

      expect(() => {
        mockKernelPlugins.addPlugin(
          getMockPlugin(
            {
              testFunction2: getMockFunction('testFunction2', 'testDescription2', { type: 'number' }),
            },
            'testPlugin'
          )
        );
      }).toThrow();
    });

    it('should set the correct pluginName to functions', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      mockKernelPlugins.addPlugin(
        getMockPlugin({
          testFunction1: getMockFunction('testFunction1'),
          testFunction2: getMockFunction('testFunction2'),
        })
      );

      // Assert
      const firstPlugin = mockKernelPlugins.getPlugins()[0];
      expect(Object.values(firstPlugin.functions).map((fn) => fn.metadata?.pluginName)).toEqual([
        'testPlugin',
        'testPlugin',
      ]);
    });
  });

  describe('getPlugins', () => {
    it('should return all plugins', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();
      const mockPlugin1 = getMockPlugin(
        {
          testFunction1: getMockFunction('testFunction1'),
          testFunction2: getMockFunction('testFunction2'),
        },
        'testPlugin1',
        'testDescription1'
      );
      const mockPlugin2 = getMockPlugin(
        {
          testFunction1: getMockFunction('testFunction1'),
          testFunction2: getMockFunction('testFunction2'),
        },
        'testPlugin2',
        'testDescription2'
      );

      mockKernelPlugins.addPlugin(mockPlugin1);
      mockKernelPlugins.addPlugin(mockPlugin2);

      // Act
      const plugins = mockKernelPlugins.getPlugins();

      // Assert
      expect(plugins).toHaveLength(2);
      expect(plugins[0].name).toBe('testPlugin1');
      expect(plugins[0].description).toBe('testDescription1');
      expect(plugins[1].name).toBe('testPlugin2');
      expect(plugins[1].description).toBe('testDescription2');
    });
  });

  describe('getFunction', () => {
    it('should return the correct undefined when function is not found', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();

      // Act
      const result = mockKernelPlugins.getFunction('not-found');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the undefined when pluginName is not defined', () => {
      // Arrange
      const stubPluginName = 'testPlugin';
      const stubFunctionName = 'testFunction1';
      const mockKernelPlugins = getMockKernelPlugins();
      mockKernelPlugins.addPlugin(getMockPlugin({ testFunction1: getMockFunction(stubFunctionName) }, stubPluginName));

      // Act
      const result = mockKernelPlugins.getFunction('testFunction1', 'not-found');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should return the correct function with functionName', () => {
      // Arrange
      const stubPluginName = 'testPlugin';
      const stubFunctionName = 'testFunction1';
      const mockKernelPlugins = getMockKernelPlugins();
      mockKernelPlugins.addPlugin(getMockPlugin({ testFunction1: getMockFunction(stubFunctionName) }, stubPluginName));

      // Act
      const result = mockKernelPlugins.getFunction(stubFunctionName);

      // Assert
      expect(result?.metadata?.name).toBe(stubFunctionName);
    });

    it('should return the correct function with functionName and pluginName', () => {
      // Arrange
      const stubPluginName = 'testPlugin';
      const stubFunctionName = 'testFunction1';
      const mockKernelPlugins = getMockKernelPlugins();
      mockKernelPlugins.addPlugin(getMockPlugin({ testFunction1: getMockFunction(stubFunctionName) }, stubPluginName));

      // Act
      const result = mockKernelPlugins.getFunction(stubFunctionName);

      // Assert
      expect(result?.metadata?.name).toBe(stubFunctionName);
    });
  });

  describe('getFunctionsMetadata', () => {
    it('should return all functions metadata', () => {
      // Arrange
      const mockKernelPlugins = getMockKernelPlugins();
      const mockPlugin1 = getMockPlugin(
        {
          testFunction1: getMockFunction('testFunction1', 'testDescription1', { type: 'string' }),
          testFunction2: getMockFunction('testFunction2', 'testDescription2', { type: 'number' }),
        },
        'testPlugin1',
        'testPluginDescription1'
      );
      const mockPlugin2 = getMockPlugin(
        {
          testFunction1: getMockFunction('testFunction3', 'testDescription3', { type: 'boolean' }),
          testFunction2: getMockFunction('testFunction4', 'testDescription4', { type: 'object' }),
        },
        'testPlugin2',
        'testPluginDescription2'
      );

      mockKernelPlugins.addPlugin(mockPlugin1);
      mockKernelPlugins.addPlugin(mockPlugin2);

      // Act
      const functionsMetadata = mockKernelPlugins.getFunctionsMetadata();

      // Assert
      expect(functionsMetadata).toHaveLength(4);
      expect(functionsMetadata).toEqual([
        {
          name: 'testFunction1',
          description: 'testDescription1',
          pluginName: 'testPlugin1',
          parameters: { type: 'string' },
        },
        {
          name: 'testFunction2',
          description: 'testDescription2',
          pluginName: 'testPlugin1',
          parameters: { type: 'number' },
        },
        {
          name: 'testFunction3',
          description: 'testDescription3',
          pluginName: 'testPlugin2',
          parameters: { type: 'boolean' },
        },
        {
          name: 'testFunction4',
          description: 'testDescription4',
          pluginName: 'testPlugin2',
          parameters: { type: 'object' },
        },
      ]);
    });
  });
});
