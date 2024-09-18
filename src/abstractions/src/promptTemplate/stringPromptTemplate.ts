import { PromptTemplate } from '@semantic-kernel/abstractions/src/promptTemplate/promptTemplate';

export const stringPromptTemplate = (template: string): PromptTemplate => {
  return {
    render: async () => {
      return template;
    },
  };
};
