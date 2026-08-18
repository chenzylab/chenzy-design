import type { Snippet } from 'svelte';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error' | 'warning';

/**
 * <Steps.Step> 子项 props——顶层分发器用的联合形状，实际渲染的字段集合由父
 * <Steps> 的 type 决定（nav 型不使用 description/icon/status，对齐 Semi
 * BasicStepProps/FillStepProps/NavStepProps 的差异化字段集合）。
 */
export interface StepProps {
  /** 标题（对齐 Semi title）。 */
  title?: string | Snippet;
  /** 步骤描述，可选（对齐 Semi description；nav 型无此字段）。 */
  description?: string | Snippet;
  /** 自定义该步图标（对齐 Semi icon；nav 型无此字段）。 */
  icon?: string | Snippet;
  /** 显式覆盖该步状态（对齐 Semi status；nav 型无此字段）。 */
  status?: StepStatus;
  /** 该步根节点类名（对齐 Semi Steps.Step 的 className）。 */
  class?: string;
  /** 该步根节点内联样式（对齐 Semi Steps.Step 的 style，字符串形式）。 */
  style?: string;
  /** 该步 role（对齐 Semi Steps.Step 的 role）。 */
  role?: string;
  /** 该步 aria-label（对齐 Semi Steps.Step 的 aria-label）。 */
  'aria-label'?: string;
  /** 该步点击回调（对齐 Semi Steps.Step 的 onClick）。 */
  onClick?: (e: MouseEvent) => void;
  /** 该步键盘按下回调（对齐 Semi Steps.Step 的 onKeyDown）。 */
  onKeyDown?: (e: KeyboardEvent) => void;
}
