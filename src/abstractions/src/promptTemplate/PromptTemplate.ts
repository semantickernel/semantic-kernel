import { Kernel } from '../Kernel';

export interface PromptTemplate {
  render<Props>(kernel: Kernel, Props: Props): Promise<string>;
}
