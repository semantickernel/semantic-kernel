import { PromptTemplate } from './PromptTemplate';

export class PassThroughPromptTemplate implements PromptTemplate {
  constructor(private readonly template: string) {}

  render() {
    return this.template;
  }
}
