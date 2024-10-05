import { ChatCompletionService, ChatMessageContent } from '../AI';
import { TextContent, textContent } from '../contents';
import { kernel } from '../kernel';
import { kernelFunctionFromPrompt } from './kernelFunctionFromPrompt';

const getMockChatCompletionService = () => {
  return {
    serviceType: 'ChatCompletion',
    serviceKey: 'StubChatCompletion',
    attributes: {},
    getChatMessageContents: async (messages) => {
      const messageContents: ChatMessageContent[] = [];

      for (const message of messages) {
        if (message.role === 'user') {
          messageContents.push({
            type: 'chat',
            role: 'assistant',
            items: [textContent({ text: `** ${message.items[0].text} **` })],
          });
        }
      }

      return messageContents;
    },
  } as ChatCompletionService;
};

const getMockKernel = () => {
  const sk = kernel();
  sk.addService(getMockChatCompletionService());

  return sk;
};

describe('kernelFunctionFromPrompt', () => {
  it('should render a prompt with a string template', async () => {
    // Arrange
    const mockKernel = getMockKernel();
    const promptTemplate = 'testPrompt';
    const props = {};

    // Act
    const result = await kernelFunctionFromPrompt({
      promptTemplate,
    }).invoke(mockKernel, props);

    // Assert
    expect(((result.value as ChatMessageContent).items as TextContent[])[0].text).toEqual('** testPrompt **');
    expect(result.renderedPrompt).toEqual('testPrompt');
  });

  it('should throw an error if the template format is not supported', async () => {
    // Arrange
    const mockKernel = getMockKernel();
    const promptTemplate = 'testPrompt';
    const props = {};

    // Act
    const result = kernelFunctionFromPrompt({
      promptTemplate,
      templateFormat: 'unsupported' as 'string',
    });

    // Assert
    await expect(result.invoke(mockKernel, props)).rejects.toThrow('unsupported template rendering not implemented');
  });

  it('should throw an error if no AIService is found', async () => {
    // Arrange
    const promptTemplate = 'testPrompt';
    const props = {};

    // Act
    const result = kernelFunctionFromPrompt({
      promptTemplate,
    });

    // Assert
    await expect(result.invoke(kernel(), props)).rejects.toThrow('AIService not found in kernel');
  });
});
