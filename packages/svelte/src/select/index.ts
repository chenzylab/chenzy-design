import Select_ from './Select.svelte';
import Option from './Option.svelte';
import OptionGroup from './OptionGroup.svelte';

export const Select: typeof Select_ & {
  Option: typeof Option;
  OptGroup: typeof OptionGroup;
} = Object.assign(Select_, { Option, OptGroup: OptionGroup });

export { Option, OptionGroup };
export { meta as selectMeta } from './meta.js';
export type { OptionData, OptionValue, OptionGroup as SelectOptionGroup, OptionOrGroup } from './types.js';
