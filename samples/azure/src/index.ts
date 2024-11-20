import { AzureOpenAIChatCompletionService } from '@semantic-kernel/azureopenai';
import { FunctionChoiceBehavior, kernel, kernelFunction } from "semantic-kernel";

const sk = kernel().addService(
    new AzureOpenAIChatCompletionService({
        apiKey: '1234',
        endpoint: 'http://localhost:4041',
        model: 'gpt-4',
    })
);

const temperature = kernelFunction(({ loc }) => (loc === 'Dublin' ? 10 : 24), {
    name: 'temperature',
    description: 'Returns the temperature in a given location',
    schema: {
        type: 'object',
        properties: {
            loc: { type: 'string', description: 'The location to get the temperature for' },
        },
    },
});

sk.addPlugin({
    name: 'weather',
    description: 'Weather plugin',
    functions: [temperature],
});

function test() {
     sk.invokePrompt({
        promptTemplate: 'Return the current temperature in Dublin',
        executionSettings: {
            functionChoiceBehavior: FunctionChoiceBehavior.Auto(),
        },
    }).then((result) => {
        console.log(result?.value);
    });
}

test();