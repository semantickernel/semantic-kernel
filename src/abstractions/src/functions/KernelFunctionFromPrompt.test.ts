import { ChatCompletionService } from '../AI';
import { kernel } from '../Kernel';
import { ChatMessageContent, TextContent } from '../contents';
import { KernelFunctionFromPrompt } from './KernelFunctionFromPrompt';

const getMockChatCompletionService = () => {
  return {
    serviceType: 'ChatCompletion',
    serviceKey: 'StubChatCompletion',
    attributes: {},
    getChatMessageContents: async ({ prompt }) => {
      const messageContents: ChatMessageContent[] = [];

      messageContents.push(
        new ChatMessageContent<'assistant'>({
          role: 'assistant',
          items: [new TextContent({ text: `** ${prompt} **` })],
        })
      );

      return messageContents;
    },
  } as ChatCompletionService;
};

const getMockKernel = () => kernel().addService(getMockChatCompletionService());

describe('kernelFunctionFromPrompt', () => {
  it('should render a prompt with a string template', async () => {
    // Arrange
    const mockKernel = getMockKernel();
    const promptTemplate = 'testPrompt';

    // Act
    const result = await KernelFunctionFromPrompt.create({
      promptTemplate,
    }).invoke(mockKernel);

    // Assert
    expect(((result.value as ChatMessageContent).items as TextContent[])[0].text).toEqual('** testPrompt **');
    expect(result.renderedPrompt).toEqual('testPrompt');
  });

  it('should throw an error if the template format is not supported', async () => {
    // Arrange
    const mockKernel = getMockKernel();
    const promptTemplate = 'testPrompt';

    // Act
    const result = KernelFunctionFromPrompt.create({
      promptTemplate,
      templateFormat: 'unsupported' as 'passthrough',
    });

    // Assert
    await expect(result.invoke(mockKernel)).rejects.toThrow('unsupported template rendering not implemented');
  });

  it('should throw an error if no AIService is found', async () => {
    // Arrange
    const promptTemplate = 'testPrompt';

    // Act
    const result = KernelFunctionFromPrompt.create({
      promptTemplate,
    });

    // Assert
    await expect(result.invoke(kernel())).rejects.toThrow('AIService not found in kernel');
  });
});
