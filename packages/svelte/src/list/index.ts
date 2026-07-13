import List_ from './List.svelte';
import ListItem from './ListItem.svelte';

// List 挂 Item 子组件（List.Item），对齐 Semi `List.Item = ListItem`。
export const List: typeof List_ & {
  Item: typeof ListItem;
} = Object.assign(List_, { Item: ListItem });

export { ListItem };
export { meta as listMeta } from './meta.js';
export {
  getListContext,
  setListContext,
  type ListContext,
  type ListGrid,
} from './context.js';
