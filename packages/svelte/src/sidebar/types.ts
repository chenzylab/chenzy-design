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
