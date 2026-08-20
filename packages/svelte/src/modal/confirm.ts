/**
 * confirm — 严格镜像 Semi @douyinfe/semi-ui/modal/confirm.tsx 的类型工厂部分
 * （withInfo/withSuccess/withWarning/withError/withConfirm）：每种命令式类型
 * 对应的具名图标 + 按钮类型覆盖。ConfirmModal.svelte 与 command.svelte.ts 都
 * 消费本文件，避免类型→图标映射重复硬编码。
 *
 * 挂载引擎（对应 confirm.tsx 里 document.createElement + reactRender/reactUnmount
 * 那部分）不在本文件——Svelte 场景走 `mount`/`unmount`，已在 command.svelte.ts。
 */

import type { Component } from 'svelte';
import type { IconSize } from '@chenzy-design/icons';
import {
  IconInfoCircle,
  IconTickCircle,
  IconAlertTriangle,
  IconAlertCircle,
  IconHelpCircle,
} from '@chenzy-design/icons';

export type ConfirmType = 'confirm' | 'info' | 'success' | 'warning' | 'error';

/** 图标组件统一 props 形状（对齐 @chenzy-design/icons 具名图标，含其索引签名）。 */
interface IconProps {
  size?: IconSize;
  spin?: boolean;
  rotate?: number;
  fill?: string;
  class?: string;
  style?: string;
  [key: string]: unknown;
}

export interface ConfirmTypeConfig {
  icon: Component<IconProps>;
  /** 对齐 Semi withError：仅 error 类型默认把确认按钮覆盖为 danger。 */
  okButtonType?: 'danger';
}

/**
 * type → { icon, okButtonType } 映射表。对齐 Semi withInfo/withSuccess/withWarning/
 * withError/withConfirm 五个工厂函数：只有 withError 覆盖 okButtonProps.type='danger'，
 * withWarning 不覆盖（保持默认 primary）。
 */
export const confirmTypeConfig: Record<ConfirmType, ConfirmTypeConfig> = {
  info: { icon: IconInfoCircle },
  success: { icon: IconTickCircle },
  warning: { icon: IconAlertTriangle },
  error: { icon: IconAlertCircle, okButtonType: 'danger' },
  confirm: { icon: IconHelpCircle },
};
