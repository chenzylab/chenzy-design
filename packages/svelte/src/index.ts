/**
 * @chenzy-design/svelte — Svelte 5 component implementations.
 * Each component is its own entry for tree-shaking.
 */
export { Button, ButtonGroup, SplitButtonGroup, buttonMeta } from './button/index.js';
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
export { TextArea, textareaMeta } from './textarea/index.js';
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
export { DatePicker, datePickerMeta, RangePicker, rangePickerMeta } from './date-picker/index.js';
export { TimePicker, timePickerMeta } from './time-picker/index.js';
export { Cascader, cascaderMeta, type CascaderNode } from './cascader/index.js';
export {
  TreeSelect,
  treeSelectMeta,
  type TreeNode,
  type TreeKey,
} from './tree-select/index.js';
export { Transfer, transferMeta, type TransferItem, type TransferGroup } from './transfer/index.js';
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
export {
  Nav,
  NavHeader,
  NavFooter,
  NavItem,
  NavSub,
  navMeta,
  type NavItemDef,
  type NavKey,
  type NavMode,
} from './nav/index.js';
export { Anchor, anchorMeta, type AnchorLink } from './anchor/index.js';

// --- M4 Show ---
export { Tag, tagMeta } from './tag/index.js';
export {
  ScrollList,
  scrollListMeta,
  type ScrollListItem,
  type ScrollListValue,
} from './scroll-list/index.js';
export { Avatar, AvatarGroup, avatarMeta } from './avatar/index.js';
export { Badge, badgeMeta } from './badge/index.js';
export { Card, cardMeta } from './card/index.js';
export { Tooltip, tooltipMeta } from './tooltip/index.js';
export { Popover, popoverMeta } from './popover/index.js';
export { Empty, emptyMeta } from './empty/index.js';
export {
  Descriptions,
  DescriptionsItem,
  descriptionsMeta,
  type DescriptionItem,
} from './descriptions/index.js';
export {
  Collapse,
  CollapsePanelComponent,
  collapseMeta,
  type CollapsePanel,
  type CollapseContext,
} from './collapse/index.js';
export { Timeline, TimelineItem, timelineMeta, type TimelineItemData } from './timeline/index.js';
export { List, listMeta } from './list/index.js';
export { Image, ImagePreviewGroup, imageMeta } from './image/index.js';
export { Highlight, highlightMeta } from './highlight/index.js';
export { CodeHighlight, codeHighlightMeta } from './code-highlight/index.js';
export {
  JsonViewer,
  jsonViewerMeta,
  type JsonViewerOptions,
  type CustomRenderRule,
  type TokenRenderType,
} from './json-viewer/index.js';
export { VirtualList, virtualListMeta } from './virtual-list/index.js';
export { OverflowList, overflowListMeta } from './overflow-list/index.js';
export {
  MarkdownRender,
  defaultComponents as markdownRenderDefaultComponents,
  markdownRenderMeta,
  type HastRoot,
  type CompileToHastOptions,
  type UnifiedPluginEntry,
} from './markdown-render/index.js';
export {
  VideoPlayer,
  videoPlayerMeta,
  type VideoMarker,
  type PlaybackRateOption,
  type LabeledOption,
} from './video-player/index.js';
export { AudioPlayer, audioPlayerMeta } from './audio-player/index.js';
export {
  Chat,
  ChatBox,
  ChatInputBox,
  ChatHint,
  chatMeta,
  type Message as ChatMessage,
  type Metadata as ChatMetadata,
  type RoleConfig as ChatRoleConfig,
  type Content as ChatContent,
  type ChatAttachment,
  type ChatAlign,
  type ChatMode,
  type SendHotKey,
  type EnableUploadProps as ChatEnableUploadProps,
} from './chat/index.js';
export {
  AIChatDialogue,
  AIChatDialogueBox,
  AIChatDialogueContentItem,
  aiChatDialogueMeta,
  responseToMessage,
  chatCompletionToMessage,
  contentItemType,
  normalizeDialogueContent,
  type AIDialogueMessage,
  type AIDialogueMetadata,
  type AIDialogueRoleConfig,
  type AIDialogueReference,
  type ContentItem as AIDialogueContentItem,
  type AIMessageStatus,
  type OpenAIResponseObject,
  type ChatCompletionObject,
} from './ai-chat-dialogue/index.js';
export {
  AIChatInput,
  aiChatInputMeta,
  isSendHotKey,
  resolveCanSend,
  buildMessageContent,
  transformDocToContents,
  suggestionContent,
  nextSuggestionIndex,
  referenceLabel,
  isImageReference,
  type AIChatInputContent,
  type AIChatInputAttachment,
  type AIChatInputReference,
  type AIChatInputMessageContent,
  type AIChatInputSendHotKey,
  type AIChatInputChangePayload,
  type AIChatInputSuggestion,
} from './ai-chat-input/index.js';
export {
  Cropper,
  cropperMeta,
  type CropperShape,
  type CropperCorner,
  type CropperBox,
  type CropperImageState,
  type CropperPoint,
} from './cropper/index.js';

// --- M5 Feedback ---
export { Spin, spinMeta } from './spin/index.js';
export {
  Progress,
  progressMeta,
  type ProgressStatus,
  type ProgressType,
} from './progress/index.js';
export { Carousel, carouselMeta } from './carousel/index.js';
export {
  Skeleton,
  SkeletonTitle,
  SkeletonParagraph,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonButton,
  skeletonMeta,
} from './skeleton/index.js';
export { Banner, bannerMeta, type BannerType } from './banner/index.js';
export {
  Modal,
  modalMeta,
  modal,
  type ModalCommandConfig,
  type ModalCommandHandle,
} from './modal/index.js';
export { Popconfirm, popconfirmMeta } from './popconfirm/index.js';
export { Drawer, drawerMeta } from './drawer/index.js';
export { SideSheet, sideSheetMeta } from './side-sheet/index.js';
// TreeNodeData/TreeKey 经 ./tree 子路径或 @chenzy-design/core 暴露；
// 此处不在根 barrel 重导出类型，避免与 tree-select 的 TreeKey 命名冲突。
export { Tree, treeMeta } from './tree/index.js';
// Table 的 ColumnDef/RowSelection/RowKey 等类型经 ./table 子路径暴露；
// 此处仅在根 barrel 导出组件与 meta，避免类型命名冲突。
export { Table, tableMeta } from './table/index.js';
export { Calendar, calendarMeta, type CalendarEvent } from './calendar/index.js';
export {
  Toast,
  toastMeta,
  type ToastType,
  type ToastOptions,
  type ToastItem,
} from './toast/index.js';
export {
  notification,
  notificationMeta,
  type NotificationType,
  type NotificationOptions,
  type NotificationItem,
  type NotificationPlacement,
} from './notification/index.js';

// --- M6 Other ---
export { BackTop, backTopMeta } from './back-top/index.js';
export {
  LocaleProvider,
  LOCALE_CONTEXT_KEY,
  getLocaleContext,
  useLocale,
  localeProviderMeta,
  type LocaleApi,
} from './locale-provider/index.js';
export {
  ConfigProvider,
  CONFIG_CONTEXT_KEY,
  getConfigContext,
  configProviderMeta,
  type ConfigContextValue,
} from './config-provider/index.js';
export {
  ResizeObserver,
  resize,
  resizeObserverMeta,
  type ResizeActionParams,
  type CDResizeEntry,
  type ResizeBox,
  createResizeObserver,
} from './resize-observer/index.js';
export {
  LottieIcon,
  lottieIconMeta,
  type LottiePlayerAdapter,
  type LottiePlayerFactory,
  type LottieSegments,
} from './lottie-icon/index.js';
// 浮层定位原语（Tooltip/Popover 等共用，未来 Dropdown/Popconfirm 复用）
export {
  useFloating,
  type UseFloatingOptions,
  type FloatingHandle,
} from './_floating/use-floating.js';
export { computePosition, type Placement } from '@chenzy-design/core';
// 内置语言包 + 注册/解析/合并工具重导出，供 LocaleProvider 直接使用
export {
  zh_CN,
  en_US,
  type Locale,
  registerLocale,
  unregisterLocale,
  resolveLocale,
  mergeLocale,
  type PartialLocale,
} from '@chenzy-design/locale';
