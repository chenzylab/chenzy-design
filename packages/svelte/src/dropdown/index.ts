import Dropdown_ from './Dropdown.svelte';
import DropdownItem from './DropdownItem.svelte';
import DropdownMenu from './DropdownMenu.svelte';
import DropdownTitle from './DropdownTitle.svelte';
import DropdownDivider from './DropdownDivider.svelte';

// Dropdown 挂载声明式子组件：Menu / Item / Title / Divider（对齐 Semi 静态成员）。
export const Dropdown: typeof Dropdown_ & {
  Menu: typeof DropdownMenu;
  Item: typeof DropdownItem;
  Title: typeof DropdownTitle;
  Divider: typeof DropdownDivider;
} = Object.assign(Dropdown_, {
  Menu: DropdownMenu,
  Item: DropdownItem,
  Title: DropdownTitle,
  Divider: DropdownDivider,
});

export { DropdownMenu, DropdownItem, DropdownTitle, DropdownDivider };
export { meta as dropdownMeta } from './meta.js';
export type {
  DropdownKey,
  DropdownItemType,
  DropdownMenuItem,
  DropdownMenuItemItem,
  DropdownMenuItemTitle,
  DropdownMenuItemDivider,
} from './types.js';
