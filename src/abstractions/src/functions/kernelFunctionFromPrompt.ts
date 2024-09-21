import { ChatCompletionService, ChatMessageContent, PromptExecutionSettings, userChatMessage } from '../AI';
import { Kernel } from '../kernel';
import { PromptTemplateConfig, stringPromptTemplate } from '../promptTemplate';
import { AIService } from '../services';
import { KernelFunction } from './kernelFunction';
import { FromSchema } from 'json-schema-to-ts';

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
      case 'handlebars':
        // Handle handlebars template rendering here
        throw new Error('Handlebars template rendering not implemented');
      case 'string':
      default:
        return stringPromptTemplate(promptTemplateConfig.template);
    }
  };

  const renderPrompt = async (kernel: Kernel, props: PromptType): Promise<PromptRenderingResult> => {
    const promptTemplate = getPromptTemplate();

    const { service } =
      kernel.serviceProvider.getService({
        serviceType: 'ChatCompletion',
      }) ||
      kernel.serviceProvider.getService({
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
        const chatContents = await (AIService as ChatCompletionService).getChatMessageContents(
          [userChatMessage(renderedPrompt)],
          executionSettings,
          kernel
        );

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
