import Dropdown_ from './Dropdown.svelte';
import DropdownItem from './DropdownItem.svelte';
import DropdownMenu from './DropdownMenu.svelte';
import DropdownSubMenu from './DropdownSubMenu.svelte';
import DropdownTitle from './DropdownTitle.svelte';
import DropdownDivider from './DropdownDivider.svelte';

// Dropdown 挂载声明式子组件：Item / Menu / SubMenu / Title / Divider。
export const Dropdown: typeof Dropdown_ & {
  Item: typeof DropdownItem;
  Menu: typeof DropdownMenu;
  SubMenu: typeof DropdownSubMenu;
  Title: typeof DropdownTitle;
  Divider: typeof DropdownDivider;
} = Object.assign(Dropdown_, {
  Item: DropdownItem,
  Menu: DropdownMenu,
  SubMenu: DropdownSubMenu,
  Title: DropdownTitle,
  Divider: DropdownDivider,
});

export { DropdownItem, DropdownMenu, DropdownSubMenu, DropdownTitle, DropdownDivider };
export { meta as dropdownMeta } from './meta.js';
export {
  isDropdownDivider,
  isDropdownGroup,
  hasDropdownChildren,
} from './types.js';
export type {
  DropdownItem as DropdownItemType,
  DropdownItemNode,
  DropdownDividerNode,
  DropdownGroupNode,
  DropdownKey,
} from './types.js';
