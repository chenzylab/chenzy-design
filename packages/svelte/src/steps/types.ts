import type { Snippet } from 'svelte';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error' | 'warning';

export interface StepItem {
  title: string;
  description?: string;
  /** 显式覆盖该步状态；不传时由 current 推断 */
  status?: StepStatus;
  /**
   * 自定义该步图标：字符串（emoji/文本）或 Snippet。提供时替代默认序号/✓/✕。
   * 对齐 Semi Steps.Step 的 icon（每步独立）。
   */
  icon?: string | Snippet;
  /** 该步 aria-label（对齐 Semi Steps.Step 的 aria-label） */
  ariaLabel?: string;
  /** 该步点击回调（对齐 Semi Steps.Step 的 onClick） */
  onClick?: (e: MouseEvent) => void;
  /** 该步键盘按下回调（对齐 Semi Steps.Step 的 onKeyDown） */
  onKeyDown?: (e: KeyboardEvent) => void;
}
