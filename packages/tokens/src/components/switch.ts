/**
 * Component tokens for Switch. 曾全量对齐 Semi Design（semi-foundation/switch/variables.scss），
 * 现按 DSM「Token 精简原则」清理孤儿：仅保留组件实际消费的 token 及其中间节点。
 * 我们的开关滑块用 inset-inline-start 定位而非 translateX，故删去全部 spacing-switch-*-translatex
 * 位移及相关 knob/spin 尺寸孤儿。带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾为 chenzy-design Switch 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi $motion-switch-transitionDuration: 200ms 对齐我们 --cd-motion-duration-mid（= 200ms）。
 *  - Semi calc（$width-switch_knob_active 等）忠实翻译为 CSS calc(...)。
 */
import type { TokenGroup } from './token-def.js';

export const switchTokens = {
  // —— Other：滑块 / 加载图标位移距离 + 动画时长 ——
  'motion-switch-transitionduration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '开关动画时长', usage: '开关动画时长' },

  // —— Color ——
  'color-switch-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '关闭态背景色', usage: '关闭态(未选中)开关背景色 - 默认' },
  'color-switch-checked-bg-default': { value: 'var(--cd-color-success)', category: 'color', label: '开启态背景色', usage: '开启态开关背景色 - 默认' },
  'color-switch-knob-bg-default': { value: 'var(--cd-color-white)', category: 'color', label: '滑块背景色', usage: '开关滑块背景颜色 - 关闭态' },
  'color-switch-checked-text-default': { value: 'var(--cd-color-white)', category: 'color', label: '开启态文案色', usage: '开启态开关文案颜色' },

  // —— Width / Height ——
  'width-switch': { value: '40px', category: 'width', label: '开关宽度', usage: '开关宽度' },
  'height-switch': { value: '24px', category: 'height', label: '开关高度', usage: '开关高度' },
  'height-switch-large': { value: '32px', category: 'height', label: '大尺寸高度', usage: '大尺寸开关高度' },
  'width-switch-large': { value: '54px', category: 'width', label: '大尺寸宽度', usage: '大尺寸开关宽度' },
  'height-switch-small': { value: '16px', category: 'height', label: '小尺寸高度', usage: '小尺寸开关高度' },
  'width-switch-small': { value: '26px', category: 'width', label: '小尺寸宽度', usage: '小尺寸开关宽度' },

  // —— chenzy-design Switch 实际消费的补充 token（Semi 无 / 命名差异；组件消费） ——
  'switch-height-default': { value: 'var(--cd-height-switch)', category: 'height', label: '开关高度', usage: '开关高度 - 默认（组件消费）' },
  'switch-height-small': { value: 'var(--cd-height-switch-small)', category: 'height', label: '开关高度', usage: '开关高度 - 小尺寸（组件消费）' },
  'switch-height-large': { value: 'var(--cd-height-switch-large)', category: 'height', label: '开关高度', usage: '开关高度 - 大尺寸（组件消费）' },
  'switch-width-default': { value: 'var(--cd-width-switch)', category: 'width', label: '开关宽度', usage: '开关宽度 - 默认（组件消费）' },
  'switch-width-small': { value: 'var(--cd-width-switch-small)', category: 'width', label: '开关宽度', usage: '开关宽度 - 小尺寸（组件消费）' },
  'switch-width-large': { value: 'var(--cd-width-switch-large)', category: 'width', label: '开关宽度', usage: '开关宽度 - 大尺寸（组件消费）' },
  'switch-bg-off': { value: 'var(--cd-color-switch-default-bg-default)', category: 'color', label: '关闭背景色', usage: '关闭态开关背景（组件消费）' },
  'switch-bg-on': { value: 'var(--cd-color-switch-checked-bg-default)', category: 'color', label: '开启背景色', usage: '开启态开关背景（组件消费）' },
  'switch-bg-on-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '警示开启背景色', usage: 'warning 状态开启态开关背景（组件消费）' },
  'switch-bg-on-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误开启背景色', usage: 'error 状态开启态开关背景（组件消费）' },
  'switch-knob-bg': { value: 'var(--cd-color-switch-knob-bg-default)', category: 'color', label: '滑块背景色', usage: '开关滑块背景（组件消费）' },
  'switch-radius': { value: 'var(--cd-border-radius-full)', category: 'radius', label: '开关圆角', usage: '开关圆角（组件消费）' },
  'switch-label-color': { value: 'var(--cd-color-switch-checked-text-default)', category: 'color', label: '开关文案色', usage: '开关内文案颜色（组件消费）' },
  'switch-label-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '文案字号', usage: '开关内文案字号（组件消费）' },
  'switch-label-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '文案内间距', usage: '开关内文案内间距（组件消费）' },
  'switch-label-padding-start': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '开启文案左内距', usage: '开启态文案左内间距（组件消费）' },
  'switch-label-padding-end': { value: 'var(--cd-spacing-base-loose)', category: 'spacing', label: '开启文案右内距', usage: '开启态文案右内间距（组件消费）' },
  'switch-outline-focus': { value: 'var(--cd-focus-ring)', category: 'other', label: '聚焦轮廓', usage: '开关聚焦轮廓阴影（组件消费）' },
  'switch-transition-duration': { value: 'var(--cd-motion-switch-transitionduration)', category: 'animation', label: '过渡时长', usage: '开关过渡动画时长（组件消费）' },
  'switch-transition-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '过渡曲线', usage: '开关过渡动画曲线（组件消费）' },
  'switch-spinner-track': { value: 'var(--cd-color-grey-3)', category: 'color', label: '加载轨道色', usage: '加载 spinner 轨道颜色（组件消费）' },
  'switch-spinner-indicator': { value: 'var(--cd-color-primary)', category: 'color', label: '加载指示色', usage: '加载 spinner 指示颜色（组件消费）' },
  'switch-spinner-duration': { value: 'var(--cd-motion-duration-slow)', category: 'animation', label: '加载动画时长', usage: '加载 spinner 旋转时长（组件消费）' },
} satisfies TokenGroup;
