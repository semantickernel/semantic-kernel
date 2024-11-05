export type PromptTemplateFormat = 'handlebars' | 'passthrough';

export type PromptTemplateConfig = {
  name?: string;
  description?: string;
  templateFormat: PromptTemplateFormat;
  template: string;
  inputVariables?: string[];
  allowDangerouslySetContent?: boolean;
};
