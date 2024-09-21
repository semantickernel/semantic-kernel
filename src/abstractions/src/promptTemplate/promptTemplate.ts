import { Kernel } from '../kernel';

export interface PromptTemplate {
  render<Props>(kernel: Kernel, Props: Props): Promise<string>;
}
