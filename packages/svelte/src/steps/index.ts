import Steps_ from './Steps.svelte';
import Step from './Step.svelte';

export const Steps: typeof Steps_ & {
  Step: typeof Step;
} = Object.assign(Steps_, { Step });

export { Step };
export { meta as stepsMeta } from './meta.js';
export type { StepProps, StepStatus } from './types.js';
export {
  getStepsContext,
  setStepsContext,
  type StepsContext,
  type StepsType,
  type StepsSize,
  type StepsDirection,
} from './context.js';
