import { PromptExecutionSettings } from "../AI";


export type PromptTemplateConfig = {
  name?: string;
  description?: string;
  templateFormat: 'handlebars' | 'string';
  template: string;
  inputVariables: string[];
  allowDangerouslySetContent?: boolean;
  executionSettings?: Map<string, PromptExecutionSettings>;
};
