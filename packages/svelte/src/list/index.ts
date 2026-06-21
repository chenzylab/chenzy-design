import List_ from './List.svelte';
import ListItem_ from './ListItem.svelte';
import ListMeta from './ListMeta.svelte';

// List.Item 挂 Meta 子组件（List.Item.Meta），List 挂 Item（及 Item.Meta 镜像）。
const ListItem: typeof ListItem_ & { Meta: typeof ListMeta } = Object.assign(ListItem_, {
  Meta: ListMeta,
});

export const List: typeof List_ & {
  Item: typeof ListItem;
  Meta: typeof ListMeta;
} = Object.assign(List_, { Item: ListItem, Meta: ListMeta });

export { ListItem, ListMeta };
export { meta as listMeta } from './meta.js';
export {
  getListContext,
  setListContext,
  type ListContext,
} from './context.js';
