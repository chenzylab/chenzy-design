// 组件在 Semi Design 官网侧边栏中的显示顺序（源自 semi-design content/*/index.md
// frontmatter 的 order 字段，逐条核对提取，未做任何推测）。
// key 为组件的驼峰 name（与 components.json meta.name 一致）；value 为 Semi 侧的 order 数值，
// 数值本身无业务含义，仅用于组内升序排序。
// 本库独有、Semi 官网无对应文档页的组件（ResizeObserver、VirtualList）不在表中，
// 排序时回退到 Infinity，固定排在所在分类的末尾。
export const semiOrder: Record<string, number> = {
  // basic
  Layout: 19,
  Grid: 20,
  Resizable: 21,
  Button: 22,
  FloatButton: 23,
  Typography: 24,
  Divider: 25,
  Icon: 26,
  Space: 27,
  // plus
  Chat: 28,
  CodeHighlight: 29,
  MarkdownRender: 30,
  DragMove: 31,
  JsonViewer: 32,
  HotKeys: 33,
  Lottie: 34,
  AudioPlayer: 98,
  VideoPlayer: 99,
  // input
  AutoComplete: 35,
  Cascader: 36,
  Checkbox: 37,
  ColorPicker: 38,
  DatePicker: 39,
  Form: 40,
  Input: 41,
  InputNumber: 42,
  PinCode: 43,
  Radio: 44,
  Rating: 45,
  Select: 46,
  Slider: 47,
  Switch: 48,
  TagInput: 49,
  TimePicker: 50,
  Transfer: 51,
  TreeSelect: 52,
  Upload: 53,
  // navigation（Nav 对应 Semi 的 Navigation）
  Anchor: 54,
  BackTop: 55,
  Breadcrumb: 56,
  Nav: 57,
  Pagination: 58,
  Steps: 59,
  Tabs: 60,
  Tree: 61,
  // show（Dropdown/Modal 已随 category 一并对齐 Semi，归入 show）
  Avatar: 62,
  Badge: 63,
  Calendar: 64,
  Card: 65,
  Carousel: 66,
  Collapse: 67,
  Collapsible: 68,
  Descriptions: 69,
  Dropdown: 70,
  Empty: 71,
  Highlight: 72,
  Image: 73,
  Cropper: 74,
  List: 75,
  Modal: 76,
  OverflowList: 77,
  Popover: 78,
  ScrollList: 79,
  SideSheet: 80,
  Table: 81,
  Tag: 82,
  Timeline: 83,
  Tooltip: 84,
  UserGuide: 85,
  // feedback
  Banner: 87,
  Notification: 88,
  Feedback: 89,
  Popconfirm: 90,
  Progress: 91,
  Skeleton: 92,
  Spin: 93,
  Toast: 94,
  // other（LocaleProvider 对应 Semi 的 LocaleProvider）
  ConfigProvider: 95,
  LocaleProvider: 96,
  // ai
  AIChatInput: 101,
  AIChatDialogue: 102,
  SideBar: 103,
};

/** 组内排序比较器：按 Semi order 升序；Semi 无对应页的组件固定排在分类末尾（按名称兜底稳定排序）。 */
export function compareBySemiOrder(a: { name: string }, b: { name: string }): number {
  const orderA = semiOrder[a.name] ?? Infinity;
  const orderB = semiOrder[b.name] ?? Infinity;
  if (orderA !== orderB) return orderA - orderB;
  return a.name.localeCompare(b.name);
}
