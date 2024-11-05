import { PromptTemplate } from '@semantic-kernel/abstractions/src/promptTemplate/promptTemplate';

export class PassThroughPromptTemplate implements PromptTemplate {
  constructor(private readonly template: string) {}

  render() {
    return this.template;
  }
}
