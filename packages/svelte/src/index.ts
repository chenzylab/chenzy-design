/**
 * @chenzy-design/svelte — Svelte 5 component implementations.
 * Each component is its own entry for tree-shaking.
 */
export { Button, buttonMeta } from './button/index.js';
export { Icon, iconMeta } from './icon/index.js';
export { Divider, dividerMeta } from './divider/index.js';
export { Space, spaceMeta } from './space/index.js';
export {
  Typography,
  Title,
  Text,
  Paragraph,
  Link,
  typographyMeta,
} from './typography/index.js';
export { Row, Col, gridMeta } from './grid/index.js';
export {
  Layout,
  LayoutHeader,
  LayoutFooter,
  LayoutContent,
  LayoutSider,
  layoutMeta,
} from './layout/index.js';

// --- M2 Input ---
export { Input, inputMeta } from './input/index.js';
export { Textarea, textareaMeta } from './textarea/index.js';
export { Switch, switchMeta } from './switch/index.js';
export { Checkbox, CheckboxGroup, checkboxMeta } from './checkbox/index.js';
export { Radio, RadioGroup, radioMeta } from './radio/index.js';
export { InputNumber, inputNumberMeta } from './input-number/index.js';
export { Rating, ratingMeta } from './rating/index.js';
export { Slider, sliderMeta } from './slider/index.js';
export { Form, FormField, FormInput, formMeta } from './form/index.js';
export { Select, selectMeta, type OptionData } from './select/index.js';
export { AutoComplete, autocompleteMeta } from './autocomplete/index.js';
export { TagInput, tagInputMeta } from './tag-input/index.js';
export { ColorPicker, colorPickerMeta } from './color-picker/index.js';
export { DatePicker, datePickerMeta } from './date-picker/index.js';
export { TimePicker, timePickerMeta } from './time-picker/index.js';
export { Cascader, cascaderMeta, type CascaderNode } from './cascader/index.js';
export {
  TreeSelect,
  treeSelectMeta,
  type TreeNode,
  type TreeKey,
} from './tree-select/index.js';
export { Transfer, transferMeta, type TransferItem } from './transfer/index.js';
export {
  Upload,
  uploadMeta,
  type UploadFileItem,
  type UploadStatus,
} from './upload/index.js';

// --- M3 Navigation ---
export {
  Breadcrumb,
  BreadcrumbItem,
  breadcrumbMeta,
  type BreadcrumbRoute,
} from './breadcrumb/index.js';
export { Pagination, paginationMeta } from './pagination/index.js';
export { Steps, stepsMeta, type StepItem } from './steps/index.js';
export { Tabs, TabPane, tabsMeta, type TabItem } from './tabs/index.js';
export { Dropdown, dropdownMeta, type DropdownItem } from './dropdown/index.js';
export { Menu, menuMeta, type MenuItemDef } from './menu/index.js';
export { Anchor, anchorMeta, type AnchorLink } from './anchor/index.js';
