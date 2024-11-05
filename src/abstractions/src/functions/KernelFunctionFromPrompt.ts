import { ChatCompletionService, ChatMessageContent, PromptExecutionSettings } from '../AI';
import { FromSchema } from '../jsonSchema';
import { Kernel } from '../kernel';
import { PromptTemplateConfig, PromptTemplateFormat, stringPromptTemplate } from '../promptTemplate';
import { AIService } from '../services';
import { KernelArguments } from './KernelArguments';
import { KernelFunction } from './KernelFunction';

export type PromptRenderingResult = {
  renderedPrompt: string;
  executionSettings?: PromptExecutionSettings;
  AIService: AIService;
};

const schema = {
  type: 'object',
} as const;

export type PromptType = FromSchema<typeof schema>;

export class KernelFunctionFromPrompt extends KernelFunction<
  PromptType,
  ChatMessageContent | ChatMessageContent[] | undefined
> {
  private readonly promptTemplateConfig: PromptTemplateConfig;

  private constructor({ promptTemplateConfig }: { promptTemplateConfig: PromptTemplateConfig }) {
    super({
      metadata: {
        name: promptTemplateConfig.name ?? KernelFunctionFromPrompt.createRandomFunctionName(),
        description: promptTemplateConfig.description,
        schema: schema,
      },
    });

    this.promptTemplateConfig = promptTemplateConfig;
  }

  /**
   * Creates a new kernel function from a prompt.
   * @param params The parameters to create the kernel function from a prompt.
   * @param params.template The template for the prompt.
   * @param params.name The name of the kernel function (optional).
   * @param params.description The description of the kernel function (optional).
   * @param params.templateFormat The format of the template (optional).
   * @param params.inputVariables The input variables for the prompt (optional).
   * @param params.allowDangerouslySetContent Whether to allow dangerously set content (optional).
   * @returns A new kernel function from a prompt.
   */
  static create({
    name,
    description,
    templateFormat,
    ...props
  }: {
    promptTemplate: string;
    name?: string;
    description?: string;
    templateFormat?: PromptTemplateFormat;
    inputVariables?: string[];
    allowDangerouslySetContent?: boolean;
  }) {
    return new KernelFunctionFromPrompt({
      promptTemplateConfig: {
        name: name ?? KernelFunctionFromPrompt.createRandomFunctionName(),
        description: description ?? 'Generic function, unknown purpose',
        templateFormat: templateFormat ?? 'string',
        template: props.promptTemplate,
        ...props,
      },
    });
  }

  override invokeCore = async (kernel: Kernel, args: KernelArguments<PromptType>) => {
    const { renderedPrompt, AIService, executionSettings } = await this.renderPrompt(kernel, args);

    if (AIService.serviceType === 'ChatCompletion') {
      const chatContents = await (AIService as ChatCompletionService).getChatMessageContents({
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
  };

  private getPromptTemplate = () => {
    switch (this.promptTemplateConfig.templateFormat) {
      case 'string':
        return stringPromptTemplate(this.promptTemplateConfig.template);
      default:
        throw new Error(`${this.promptTemplateConfig.templateFormat} template rendering not implemented`);
    }
  };

  private renderPrompt = async (kernel: Kernel, args: KernelArguments<PromptType>): Promise<PromptRenderingResult> => {
    const promptTemplate = this.getPromptTemplate();

    const { service, executionSettings } =
      kernel.services.getService({
        serviceType: 'ChatCompletion',
        kernelFunction: this,
        kernelArguments: args,
      }) ||
      kernel.services.getService({
        serviceType: 'TextCompletion',
        kernelFunction: this,
        kernelArguments: args,
      }) ||
      {};

    if (!service) {
      throw new Error('AIService not found in kernel');
    }

    return {
      renderedPrompt: await promptTemplate.render(kernel, args),
      executionSettings,
      AIService: service,
    };
  };

  private static createRandomFunctionName() {
    return `function_${Math.random().toString(36).substring(7)}`;
  }
}
