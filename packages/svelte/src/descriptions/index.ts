import Descriptions_ from './Descriptions.svelte';
import DescriptionsItem from './DescriptionsItem.svelte';

export const Descriptions: typeof Descriptions_ & {
  Item: typeof DescriptionsItem;
} = Object.assign(Descriptions_, { Item: DescriptionsItem });

export { DescriptionsItem };
export { meta as descriptionsMeta } from './meta.js';
export type { DescriptionItem } from './types.js';
export {
  getDescriptionsContext,
  setDescriptionsContext,
  type DescriptionsContext,
  type DescriptionsDirection,
} from './context.js';
