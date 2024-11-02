export type PromptTemplateFormat = 'handlebars' | 'string';

export type PromptTemplateConfig = {
  name?: string;
  description?: string;
  templateFormat: PromptTemplateFormat;
  template: string;
  inputVariables?: string[];
  allowDangerouslySetContent?: boolean;
};
