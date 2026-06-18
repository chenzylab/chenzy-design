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

// --- M4 Show ---
export { Tag, tagMeta } from './tag/index.js';
export {
  ScrollList,
  scrollListMeta,
  type ScrollListItem,
  type ScrollListValue,
} from './scroll-list/index.js';
export { Avatar, avatarMeta } from './avatar/index.js';
export { Badge, badgeMeta } from './badge/index.js';
export { Card, cardMeta } from './card/index.js';
export { Tooltip, tooltipMeta } from './tooltip/index.js';
export { Popover, popoverMeta } from './popover/index.js';
export { Empty, emptyMeta } from './empty/index.js';
export {
  Descriptions,
  descriptionsMeta,
  type DescriptionItem,
} from './descriptions/index.js';
export { Collapse, collapseMeta, type CollapsePanel } from './collapse/index.js';
export { Timeline, timelineMeta, type TimelineItemData } from './timeline/index.js';
export { List, listMeta } from './list/index.js';
export { Image, imageMeta } from './image/index.js';
export { Highlight, highlightMeta } from './highlight/index.js';
export { VirtualList, virtualListMeta } from './virtual-list/index.js';
export { OverflowList, overflowListMeta } from './overflow-list/index.js';

// --- M5 Feedback ---
export { Spin, spinMeta } from './spin/index.js';
export {
  Progress,
  progressMeta,
  type ProgressStatus,
  type ProgressType,
} from './progress/index.js';
export { Carousel, carouselMeta } from './carousel/index.js';
// TreeNodeData/TreeKey 经 ./tree 子路径或 @chenzy-design/core 暴露；
// 此处不在根 barrel 重导出类型，避免与 tree-select 的 TreeKey 命名冲突。
export { Tree, treeMeta } from './tree/index.js';
// Table 的 ColumnDef/RowSelection/RowKey 等类型经 ./table 子路径暴露；
// 此处仅在根 barrel 导出组件与 meta，避免类型命名冲突。
export { Table, tableMeta } from './table/index.js';
export { Calendar, calendarMeta, type CalendarEvent } from './calendar/index.js';
