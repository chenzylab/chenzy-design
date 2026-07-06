import type { Snippet } from 'svelte';

/** 单个 Options 图标 tab 项。对齐 Semi `{ icon, name, key }`。 */
export interface SideBarOption {
  /** 图标内容。 */
  icon?: Snippet;
  /** 可访问名 / tooltip 文案（图标 tab 的无障碍名来源）。 */
  name: string;
  /** 唯一 key。 */
  key: string;
}

/** SideBar 展示模式：main 主视图，其余为详情视图（code/file/自定义 string）。 */
export type SideBarMode = 'main' | 'code' | 'file' | (string & {});

/**
 * Annotation 单条引用条目（P2）。对齐 Semi `AnnotationItem`。
 * `type='video'` 渲染带封面/时长/播放态的视频卡片；`type='text'`（默认）渲染
 * 带站点 logo/名称/序号的文本卡片。`url` 存在时点击在新窗口打开来源。
 */
export interface SideBarAnnotationItem {
  /** 条目类型。默认 'text'。 */
  type?: 'video' | 'text';
  /** 标题。 */
  title?: string;
  /** 来源 URL（存在则点击在新窗口打开）。 */
  url?: string;
  /** 摘要/详情（text 卡片正文）。 */
  detail?: string;
  /** 站点图标 URL。 */
  logo?: string;
  /** 站点名称。 */
  siteName?: string;
  /** 引用序号。 */
  order?: number;
  /** 视频封面图 URL（video 卡片）。 */
  img?: string;
  /** 视频时长（秒，video 卡片，本地化格式化为 mm:ss）。 */
  duration?: number;
  /** 单条点击回调（优先于分组级 onClick）。 */
  onClick?: (event: Event, item: SideBarAnnotationItem) => void;
}

/**
 * 单个 MCP 工具项（P3 MCPConfigure）。对齐 Semi `MCPReactOption`
 * （= foundation `MCPOption` + `icon`/`desc` 渲染槽）。core `McpOptionCore`
 * 只承载 headless 逻辑读取的字段（value/label/active/disabled），此处扩展渲染槽。
 */
export interface SideBarMcpOption {
  /** 唯一标识（列表 key + 过滤/label 兜底）。 */
  value: string;
  /** 展示名（过滤主目标）。 */
  label: string;
  /** 前置图标：字符串按图片 URL 渲染，Snippet 自定义渲染。 */
  icon?: string | Snippet;
  /** 描述文案（副标题）。 */
  desc?: string;
  /** 是否启用。默认 false。 */
  active?: boolean;
  /** 启用开关是否锁定（预设工具，不可关闭）。默认 false。 */
  disabled?: boolean;
  /** 是否显示「配置」动作按钮（内置工具）。默认 false。 */
  configure?: boolean;
}

/** Annotation 分组（一个折叠面板）。对齐 Semi `info[]` 元素。 */
export interface SideBarAnnotationGroup {
  /** 分组标题（折叠头部内容）。 */
  header?: string;
  /** 分组唯一 key（折叠 itemKey）。 */
  key: string;
  /** 该分组下的引用条目列表。 */
  annotations: SideBarAnnotationItem[];
}
