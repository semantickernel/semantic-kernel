import { AutoInvokeKernelFunctions, OpenAIPromptExecutionSettings, openAIChatCompletionService } from '@semantic-kernel/openai';
import { kernel, kernelFunction } from 'semantic-kernel';


const sk = kernel().addService(
  openAIChatCompletionService({
    model: 'gpt-3.5-turbo',
    apiKey: '<YOUR_API_KEY>',
  })
);

const encrypt = kernelFunction(({ msg }) => `** ${msg} **`, {
  description: 'Creates an encrypted message',
  name: 'encrypt',
  pluginName: 'encryptor',
  parameters: {
    type: 'object',
    properties: {
      msg: { type: 'string', description: 'The raw message to encrypt' },
    },
  },
});

sk.plugins.addPlugin({
  name: 'encryptor',
  description: 'Encryptor plugin',
  functions: {
    encrypt,
  },
});


(async () => {
  const res = await sk.invokePrompt({
    promptTemplate: 'Encrypt this raw input message "Hello World" then return the encrypted message',
    executionSettings: {
      toolCallBehavior: AutoInvokeKernelFunctions,
    } as OpenAIPromptExecutionSettings,
  });

  console.log(JSON.stringify(res));
})();
