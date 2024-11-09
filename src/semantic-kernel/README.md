# Semantic Kernel for JavaScript

Welcome to the [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) for JavaScript. This project is not an official Microsoft product.

![Orchestrating plugins with planner](https://learn.microsoft.com/en-us/semantic-kernel/media/kernel-infographic.png)

## Install

```bash
npm install --save semantic-kernel @semantic-kernel/openai
```

## Usage

```typescript
import { OpenAIChatCompletionService } from '@semantic-kernel/openai';
import { FunctionChoiceBehavior, kernel, kernelFunction } from 'semantic-kernel';

const sk = kernel().addService(
  new OpenAIChatCompletionService({
    model: 'gpt-3.5-turbo',
    apiKey:
      'YOUR_OPENAI_API_KEY',
  })
);

const temperature = kernelFunction(({ loc }) => (loc === 'Dublin' ? 10 : 24), {
  name: 'temperature',
  description: 'Returns the temperature for the given location',
  schema: {
    type: 'object',
    properties: {
      loc: { type: 'string', description: 'The location to return the temperature for' },
    },
  },
});

sk.addPlugin({
  name: 'weather',
  description: 'Weather plugin',
  functions: [temperature],
});

const result = await sk.invokePrompt({
  promptTemplate: 'Return the current temperature in Dublin',
  executionSettings: {
      functionChoiceBehavior: FunctionChoiceBehavior.Auto(),
  },
});

// Prints the output after executing the plugin and the given prompt
console.log(result);
```

## License

Licensed under the [MIT](LICENSE) license.
