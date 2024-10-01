import { Kernel, kernel } from '../kernel';
import { kernelFunction } from './kernelFunction';


describe('kernelFunction', () => {
  describe('creating', () => {
    it('should create a kernel function with no params', () => {
      // Arrange
      const fn = () => 'testResult';
      const metadata = {
        name: 'testFunction',
        parameters: {},
      };

      // Act
      const result = kernelFunction(fn, metadata);

      // Assert
      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('invoke', () => {
    let sk: Kernel;

    beforeEach(() => {
      sk = kernel();
    });

    it('should invoke a function with no params', async () => {
      // Arrange
      const fn = () => 'testResult';
      const metadata = {
        name: 'testFunction',
        parameters: {},
      };
      const props = {};

      // Act
      const result = await kernelFunction(fn, metadata).invoke(sk, props);

      // Assert
      expect(result).toEqual({
        function: fn,
        value: 'testResult',
      });
    });

    it('should invoke a function with non-object one param', async () => {
      // Arrange
      const props = 'testValue';

      // Act
      const result = await kernelFunction((value) => `**${value}**`, {
        name: 'testFunction',
        parameters: {
          type: 'string',
        } as const,
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual('**testValue**');
    });

    it('should invoke a function with one param', async () => {
      // Arrange
      const fn = (props: { value: string }) => `**${props.value}**`;
      const props = { value: 'testValue' };

      // Act
      const result = await kernelFunction(fn, {
        name: 'testFunction',
        parameters: {
          type: 'object',
          parameters: {
            value: {
              type: 'string',
            },
          },
        },
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual('**testValue**');
    });

    it('should invoke a function with two optional params', async () => {
      // Arrange
      const props = {};

      // Act
      const result = await kernelFunction(({ p1, p2 }) => `**${p1 ?? "first"} ${p2 ?? "second"}**`, {
        name: 'testFunction',
        parameters: {
          type: 'object',
          properties: {
            p1: {
              type: 'string',
            },
            p2: {
              type: 'string',
            },
          },
        },
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual('**first second**');
    });

    it('should invoke a function with one required and one optional property', async () => {
      // Arrange
      const props = { p1: 'hello' };

      // Act
      const result = await kernelFunction(({ p1, p2 }) => `**${p1} ${p2}**`, {
        name: 'testFunction',
        parameters: {
          type: 'object',
          properties: {
            p1: {
              type: 'string',
            },
            p2: {
              type: 'string',
            },
          },
          required: ['p1'],
        } as const,
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual('**hello undefined**');
    });

    it('should invoke a function with required mixed string and number datatypes', async () => {
      // Arrange
      const props = { p1: 'hello', p2: 42 };

      // Act
      const result = await kernelFunction(({ p1, p2 }) => `**${p1} ${p2}**`, {
        name: 'testFunction',
        parameters: {
          type: 'object',
          properties: {
            p1: {
              type: 'string',
            },
            p2: {
              type: 'number',
            },
          },
          required: ['p1', 'p2'],
        } as const,
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual('**hello 42**');
    });

    it('should invoke a function with mixed optional number datatypes', async () => {
      // Arrange
      const props = { p1: 41, p2: 42 };

      // Act
      const result = await kernelFunction(({ p1, p2 }) => Math.min(p1 ?? 0, p2 ?? 0), {
        name: 'testFunction',
        parameters: {
          type: 'object',
          properties: {
            p1: {
              type: 'number',
            },
            p2: {
              type: 'number',
            },
          },
        },
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual(41);
    });

    it('should invoke a function with nested parameters', async () => {
      // Arrange
      const props = { p1: 41, nested_p1: { p2: 42 } };

      // Act
      const result = await kernelFunction(({ p1, nested_p1 }) => Math.max(p1, nested_p1.p2), {
        name: 'testFunction',
        parameters: {
          type: 'object',
          properties: {
            p1: {
              type: 'number',
            },
            nested_p1: {
              type: 'object',
              properties: {
                p2: {
                  type: 'number',
                },
              },
              required: ['p2'],
              additionalProperties: false,
            },
          },
          required: ['p1', 'nested_p1'],
          additionalProperties: false,
        } as const,
      }).invoke(sk, props);

      // Assert
      expect(result.value).toEqual(42);
    });
  });

  describe('functionInvocationFilters', () => {
    it('should call functionInvocationFilters', async () => {
      // Arrange
      const fn = () => 'testResult';
      const metadata = {
        name: 'testFunction',
        parameters: {},
      };
      const sk = kernel();
      const filterCallsHistory: number[] = [];

      sk.functionInvocationFilters.push({
        onFunctionInvocationFilter: () => {
          filterCallsHistory.push(Date.now());
        },
      });
      sk.functionInvocationFilters.push({
        onFunctionInvocationFilter: () => {
          filterCallsHistory.push(Date.now() + 5);
        },
      });

      // Act
      await kernelFunction(fn, metadata).invoke(sk, {});

      // Assert
      expect(filterCallsHistory).toHaveLength(2);
      expect(filterCallsHistory[0]).toBeLessThan(filterCallsHistory[1]);
    });
  });
});
