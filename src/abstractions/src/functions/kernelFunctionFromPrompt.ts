import { ChatCompletionService, ChatMessageContent, PromptExecutionSettings } from '../AI';
// import { TextContent } from '../contents';
import { FromSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { PromptTemplateConfig, stringPromptTemplate } from '../promptTemplate';
import { AIService } from '../services';
import { KernelFunction } from './kernelFunction';

export type PromptRenderingResult = {
  renderedPrompt: string;
  AIService: AIService;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const schema = {
  type: 'object',
} as const;

export type PromptType = FromSchema<typeof schema>;

export const kernelFunctionFromPrompt = ({
  promptTemplate,
  executionSettings,
  templateFormat,
}: {
  promptTemplate: string;
  executionSettings?: PromptExecutionSettings;
  templateFormat?: PromptTemplateConfig['templateFormat'];
}): KernelFunction<PromptType, ChatMessageContent | ChatMessageContent[] | undefined, typeof schema> => {
  const promptTemplateConfig: PromptTemplateConfig = {
    // default to the simple stringPromptTemplate if no promptTemplate is provided
    templateFormat: templateFormat ?? 'string',
    template: promptTemplate,
    inputVariables: [],
  };

  const getPromptTemplate = () => {
    switch (promptTemplateConfig.templateFormat) {
      case 'string':
        return stringPromptTemplate(promptTemplateConfig.template);
      default:
        throw new Error(`${promptTemplateConfig.templateFormat} template rendering not implemented`);
    }
  };

  const renderPrompt = async (kernel: Kernel, props: PromptType): Promise<PromptRenderingResult> => {
    const promptTemplate = getPromptTemplate();

    const { service } =
      kernel.services.getService({
        serviceType: 'ChatCompletion',
      }) ||
      kernel.services.getService({
        serviceType: 'TextCompletion',
      }) ||
      {};

    if (!service) {
      throw new Error('AIService not found in kernel');
    }

    return {
      renderedPrompt: await promptTemplate.render(kernel, props),
      AIService: service,
    };
  };

  return {
    invoke: async (kernel, props) => {
      const { renderedPrompt, AIService } = await renderPrompt(kernel, props);

      if (AIService.serviceType === 'ChatCompletion') {
        const chatContents = await (AIService as ChatCompletionService).getChatMessageContents({
          //[new ChatMessageContent({ role: 'user', items: [new TextContent({ text: renderedPrompt })] })],
          prompt: renderedPrompt,
          executionSettings,
          kernel,
        });

        if (!chatContents || chatContents.length === 0) {
          return {
            value: undefined,
            renderedPrompt: renderedPrompt,
          };
        }

        if (chatContents.length === 1) {
          return {
            value: chatContents[0],
            renderedPrompt: renderedPrompt,
          };
        }

        return {
          value: chatContents,
          renderedPrompt: renderedPrompt,
        };
      }

      throw new Error(`Unsupported AI service type: ${AIService.serviceType}`);
    },
  };
};
