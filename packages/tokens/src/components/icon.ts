/**
 * Component tokens for Icon. See specs/components/basic/Icon.spec.md.
 * 升级为带元数据的 TokenDef 结构以支持 DSM。
 * Semi 无独立 icon variables.scss（图标尺寸/色走消费侧），故保留 chenzy-design 自有 token 与现值。
 */
import type { TokenGroup } from './token-def.js';

export const iconTokens = {
  'icon-size-extra-small': { value: '12px', category: 'width', label: '尺寸（极小）', usage: '图标宽高 - extra-small' },
  'icon-size-small': { value: '14px', category: 'width', label: '尺寸（小）', usage: '图标宽高 - small' },
  'icon-size-default': { value: '16px', category: 'width', label: '尺寸（默认）', usage: '图标宽高 - default' },
  'icon-size-large': { value: '20px', category: 'width', label: '尺寸（大）', usage: '图标宽高 - large' },
  'icon-size-extra-large': { value: '24px', category: 'width', label: '尺寸（极大）', usage: '图标宽高 - extra-large' },
  'icon-color': { value: 'currentColor', category: 'color', label: '图标颜色', usage: '默认继承当前文字颜色' },
  'icon-color-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警告色', usage: '警告态图标颜色' },
  'icon-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误色', usage: '错误态图标颜色' },
  'icon-color-success': { value: 'var(--cd-color-success)', category: 'color', label: '成功色', usage: '成功态图标颜色' },
  'icon-color-info': { value: 'var(--cd-color-info)', category: 'color', label: '信息色', usage: '信息态图标颜色' },
  'icon-spin-duration': { value: '1s', category: 'animation', label: '旋转时长', usage: 'spin 图标旋转一周耗时' },
  'icon-spin-timing': { value: 'linear', category: 'animation', label: '旋转缓动', usage: 'spin 图标旋转缓动函数' },
} satisfies TokenGroup;
