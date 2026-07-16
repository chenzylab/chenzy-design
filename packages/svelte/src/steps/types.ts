import type { Snippet } from 'svelte';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error' | 'warning';

/**
 * <Steps.Step> 子项 props，对齐 Semi Steps.Step（step.tsx）。
 * title/description/icon 支持 string 或 Snippet（对齐 Semi ReactNode）。
 */
export interface StepProps {
  /** 标题（对齐 Semi title）。 */
  title?: string | Snippet;
  /** 步骤描述，可选（对齐 Semi description）。 */
  description?: string | Snippet;
  /**
   * 自定义该步图标：字符串（emoji/文本）或 Snippet。提供时替代默认序号/✓/✕/⚠。
   * 对齐 Semi Steps.Step 的 icon（每步独立）。
   */
  icon?: string | Snippet;
  /** 显式覆盖该步状态；不传时由 Steps 的 current 推断（对齐 Semi status）。 */
  status?: StepStatus;
  /** 该步根节点类名（对齐 Semi Steps.Step 的 className）。 */
  class?: string;
  /** 该步根节点内联样式（对齐 Semi Steps.Step 的 style，字符串形式）。 */
  style?: string;
  /** 该步 role（对齐 Semi Steps.Step 的 role）。 */
  role?: string;
  /** 该步 aria-label（对齐 Semi Steps.Step 的 aria-label）。 */
  ariaLabel?: string;
  /** 该步点击回调（对齐 Semi Steps.Step 的 onClick）。 */
  onClick?: (e: MouseEvent) => void;
  /** 该步键盘按下回调（对齐 Semi Steps.Step 的 onKeyDown）。 */
  onKeyDown?: (e: KeyboardEvent) => void;
}
