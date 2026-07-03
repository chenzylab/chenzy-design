/**
 * Component tokens for Switch. 全量对齐 Semi Design（semi-foundation/switch/variables.scss
 * 64 个），并升级为带元数据的 TokenDef 结构以支持 DSM。
 * 值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Switch 实际消费的补充 token（Semi 无 / 命名差异；组件消费）。
 *
 * 注：
 *  - Semi 的 var(--semi-color-white) 与 rgba(var(--semi-white), 1) 我们无对应 --cd-color-white
 *    alias，用最接近的 --cd-color-text-inverse（= #ffffff）替代，未发明新 alias。
 *  - Semi $motion-switch-transitionDuration: 200ms 对齐我们 --cd-motion-duration-mid（= 200ms）。
 *  - Semi calc（$width-switch_knob_active 等）忠实翻译为 CSS calc(...)。
 */
import type { TokenGroup } from './token-def.js';

export const switchTokens = {
  // —— Other：滑块 / 加载图标位移距离 + 动画时长 ——
  'spacing-switch-unchecked-translatex': { value: '2px', category: 'spacing', label: '未选中滑块位移', usage: '未选中态开关滑块位移距离' },
  'spacing-switch-spin-unchecked-translatex': { value: '2px', category: 'spacing', label: '未选中加载位移', usage: '未选中态加载图标位移距离' },
  'spacing-switch-checked-translatex': { value: '18px', category: 'spacing', label: '选中滑块位移', usage: '选中态开关滑块位移距离' },
  'spacing-switch-spin-checked-translatex': { value: '16px', category: 'spacing', label: '选中加载位移', usage: '选中态加载图标位移距离' },
  'spacing-switch-expand-large-translatex': { value: '10px', category: 'spacing', label: '大尺寸延展位移', usage: '大尺寸开关滑块延展位移距离' },
  'spacing-switch-unchecked-large-translatex': { value: '3px', category: 'spacing', label: '大尺寸未选中滑块位移', usage: '大尺寸未选中态开关滑块位移距离' },
  'spacing-switch-spin-unchecked-large-translatex': { value: '2px', category: 'spacing', label: '大尺寸未选中加载位移', usage: '大尺寸未选中态加载图标位移距离' },
  'spacing-switch-checked-large-translatex': { value: '26px', category: 'spacing', label: '大尺寸选中滑块位移', usage: '大尺寸选中态开关滑块位移距离' },
  'spacing-switch-spin-checked-large-translatex': { value: '22px', category: 'spacing', label: '大尺寸选中加载位移', usage: '大尺寸选中态加载图标位移距离' },
  'spacing-switch-expand-small-translatex': { value: '2px', category: 'spacing', label: '小尺寸延展位移', usage: '小尺寸开关滑块延展位移距离' },
  'spacing-switch-unchecked-small-translatex': { value: '1px', category: 'spacing', label: '小尺寸未选中滑块位移', usage: '小尺寸未选中态开关滑块位移距离' },
  'spacing-switch-spin-unchecked-small-translatex': { value: '2px', category: 'spacing', label: '小尺寸未选中加载位移', usage: '小尺寸未选中态加载图标位移距离' },
  'spacing-switch-checked-small-translatex': { value: '11px', category: 'spacing', label: '小尺寸选中滑块位移', usage: '小尺寸选中态开关滑块位移距离' },
  'spacing-switch-spin-checked-small-translatex': { value: '10px', category: 'spacing', label: '小尺寸选中加载位移', usage: '小尺寸选中态加载图标位移距离' },
  'motion-switch-transitionduration': { value: 'var(--cd-motion-duration-mid)', category: 'animation', label: '开关动画时长', usage: '开关动画时长' },

  // —— Color ——
  'color-switch-default-bg-default': { value: 'var(--cd-color-fill-0)', category: 'color', label: '关闭态背景色', usage: '关闭态(未选中)开关背景色 - 默认' },
  'color-switch-default-bg-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭态背景色', usage: '关闭态开关背景色 - 悬浮' },
  'color-switch-default-bg-active': { value: 'var(--cd-color-fill-2)', category: 'color', label: '关闭态背景色', usage: '关闭态开关背景色 - 按下' },
  'color-switch-default-border-default': { value: 'transparent', category: 'color', label: '关闭态描边色', usage: '关闭态开关描边颜色' },
  'color-switch-checked-bg-default': { value: 'var(--cd-color-success)', category: 'color', label: '开启态背景色', usage: '开启态开关背景色 - 默认' },
  'color-switch-checked-bg-hover': { value: 'var(--cd-color-success-hover)', category: 'color', label: '开启态背景色', usage: '开启态开关背景色 - 悬浮' },
  'color-switch-checked-bg-active': { value: 'var(--cd-color-success-active)', category: 'color', label: '开启态背景色', usage: '开启态开关背景色 - 按下' },
  'color-switch-disabled-bg-default': { value: 'transparent', category: 'color', label: '禁用态背景色', usage: '禁用态开关背景色' },
  'color-switch-disabled-bg-hover': { value: 'transparent', category: 'color', label: '禁用态背景色', usage: '禁用态开关背景色 - 悬浮' },
  'color-switch-disabled-bg-active': { value: 'transparent', category: 'color', label: '禁用态背景色', usage: '禁用态开关背景色 - 按下' },
  'color-switch-disabled-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '禁用态描边色', usage: '禁用态开关描边颜色' },
  'color-switch-checked-disabled-bg-default': { value: 'var(--cd-color-success-disabled)', category: 'color', label: '禁用开启背景色', usage: '禁用开启态开关背景颜色' },
  'color-switch-checked-disabled-border-default': { value: 'transparent', category: 'color', label: '禁用开启描边色', usage: '禁用开启态开关描边颜色' },
  'color-switch-knob-bg-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '滑块背景色', usage: '开关滑块背景颜色 - 关闭态' },
  'color-switch-knob-bg-checked': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '滑块背景色', usage: '开关滑块背景颜色 - 开启态' },
  'color-switch-knob-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '滑块描边色', usage: '开关滑块描边颜色' },
  'color-switch-checked-text-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '开启态文案色', usage: '开启态开关文案颜色' },
  'color-switch-unchecked-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '关闭态文案色', usage: '关闭态开关文案颜色' },
  'color-switch-loading-spin-default': { value: 'var(--cd-color-text-inverse)', category: 'color', label: '加载图标色', usage: '加载态开关loading图标颜色' },
  'color-switch-spin-checked-bg-default': { value: 'var(--cd-color-success-hover)', category: 'color', label: '开启加载背景色', usage: '已开启开关加载态loading背景颜色' },
  'color-switch-spin-unchecked-bg-default': { value: 'var(--cd-color-fill-1)', category: 'color', label: '关闭加载背景色', usage: '已关闭开关加载态loading背景颜色' },
  'color-switch-primary-outline-focus': { value: 'var(--cd-color-primary-light-active)', category: 'color', label: '轮廓聚焦色', usage: '开关轮廓 - 聚焦' },

  // —— Width / Height ——
  'width-switch': { value: '40px', category: 'width', label: '开关宽度', usage: '开关宽度' },
  'height-switch': { value: '24px', category: 'height', label: '开关高度', usage: '开关高度' },
  'width-switch-knob-expand': { value: '6px', category: 'width', label: '滑块延展宽度', usage: '开关滑块按压时延展宽度' },
  'width-switch-knob-default': { value: '18px', category: 'width', label: '滑块宽度', usage: '开关滑块宽度' },
  'width-switch-knob-active': { value: 'calc(var(--cd-width-switch-knob-default) + var(--cd-width-switch-knob-expand))', category: 'width', label: '滑块按下宽度', usage: '开关滑块按下态宽度' },
  'height-switch-large': { value: '32px', category: 'height', label: '大尺寸高度', usage: '大尺寸开关高度' },
  'width-switch-large': { value: '54px', category: 'width', label: '大尺寸宽度', usage: '大尺寸开关宽度' },
  'width-switch-knob-large': { value: '24px', category: 'width', label: '大尺寸滑块宽度', usage: '大尺寸开关滑块宽度' },
  'width-switch-knob-large-active': { value: 'calc(var(--cd-width-switch-knob-large) + var(--cd-spacing-switch-expand-large-translatex))', category: 'width', label: '大尺寸滑块按下宽度', usage: '大尺寸开关滑块按下态宽度' },
  'height-switch-small': { value: '16px', category: 'height', label: '小尺寸高度', usage: '小尺寸开关高度' },
  'width-switch-small': { value: '26px', category: 'width', label: '小尺寸宽度', usage: '小尺寸开关宽度' },
  'width-switch-knob-large-small': { value: '12px', category: 'width', label: '小尺寸滑块宽度', usage: '小尺寸开关滑块宽度' },
  'width-switch-knob-small-active': { value: 'calc(var(--cd-width-switch-knob-large-small) + var(--cd-spacing-switch-expand-small-translatex))', category: 'width', label: '小尺寸滑块按下宽度', usage: '小尺寸开关滑块按下态宽度' },
  'width-switch-knob-disabled-border': { value: '1px', category: 'width', label: '禁用滑块边框宽度', usage: '禁用态开关滑块边框宽度' },
  'width-switch-checked-unchecked-text': { value: '26px', category: 'width', label: '文案宽度', usage: '开关文案宽度' },
  'width-switch-spin-small': { value: '10px', category: 'width', label: '小尺寸加载宽度', usage: '小尺寸开关加载 spin 宽度' },
  'width-switch-spin-default': { value: '18px', category: 'width', label: '默认加载宽度', usage: '默认尺寸开关加载 spin 宽度' },
  'width-switch-spin-large': { value: '28px', category: 'width', label: '大尺寸加载宽度', usage: '大尺寸开关加载 spin 宽度' },
  'width-switch-outline': { value: '2px', category: 'width', label: '轮廓宽度', usage: '开关轮廓宽度' },

  // —— Spacing：滑块内边距 / 偏移 ——
  'spacing-switch-knob-padding': { value: '2px', category: 'spacing', label: '滑块顶边距', usage: '开关滑块顶部边距' },
  'spacing-switch-knob-large-padding': { value: '3px', category: 'spacing', label: '大尺寸滑块顶边距', usage: '大尺寸开关滑块顶部边距' },
  'spacing-switch-knob-small-padding': { value: '1px', category: 'spacing', label: '小尺寸滑块顶边距', usage: '小尺寸开关滑块顶部边距' },
  'spacing-switch-knob-left': { value: '0px', category: 'spacing', label: '滑块左偏移', usage: '开关滑块左侧偏移距离' },

  // —— Radius：开关圆角 = 高度 * 0.5 ——
  'radius-switch': { value: 'calc(var(--cd-height-switch) * 0.5)', category: 'radius', label: '开关圆角', usage: '开关圆角' },
  'radius-switch-large': { value: 'calc(var(--cd-height-switch-large) * 0.5)', category: 'radius', label: '大尺寸圆角', usage: '大尺寸开关圆角' },
  'radius-switch-small': { value: 'calc(var(--cd-height-switch-small) * 0.5)', category: 'radius', label: '小尺寸圆角', usage: '小尺寸开关圆角' },

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
  'switch-knob-inset': { value: 'var(--cd-spacing-switch-knob-padding)', category: 'spacing', label: '滑块内嵌距', usage: '滑块相对轨道的内嵌距离（组件消费）' },
  'switch-outline-focus': { value: 'var(--cd-focus-ring)', category: 'other', label: '聚焦轮廓', usage: '开关聚焦轮廓阴影（组件消费）' },
  'switch-transition-duration': { value: 'var(--cd-motion-switch-transitionduration)', category: 'animation', label: '过渡时长', usage: '开关过渡动画时长（组件消费）' },
  'switch-transition-easing': { value: 'var(--cd-motion-ease-standard)', category: 'animation', label: '过渡曲线', usage: '开关过渡动画曲线（组件消费）' },
  'switch-spinner-track': { value: 'var(--cd-color-grey-3)', category: 'color', label: '加载轨道色', usage: '加载 spinner 轨道颜色（组件消费）' },
  'switch-spinner-indicator': { value: 'var(--cd-color-primary)', category: 'color', label: '加载指示色', usage: '加载 spinner 指示颜色（组件消费）' },
  'switch-spinner-duration': { value: 'var(--cd-motion-duration-slow)', category: 'animation', label: '加载动画时长', usage: '加载 spinner 旋转时长（组件消费）' },
} satisfies TokenGroup;
