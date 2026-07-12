/**
 * Component tokens for Empty / Descriptions / Collapse / Timeline（M4 Show）。
 * 四组件共用本文件，全量对齐 Semi Design：
 *   - empty/variables.scss（6）
 *   - descriptions/variables.scss（19）
 *   - collapse/variables.scss（20）
 *   - timeline/variables.scss（仅保留组件消费的 token，孤儿已精简）
 * 升级为带元数据的 TokenDef 结构以支持 DSM。Semi $xxx-comp_yyy 全量按
 * kebab（组件各自前缀）翻译；var(--semi-color-*) → var(--cd-color-*)；
 * $spacing-* → var(--cd-spacing-*)、var(--semi-border-radius-*) → var(--cd-border-radius-*)、
 * $font-weight-bold → var(--cd-font-weight-bold)、$font-size-* → var(--cd-font-size-*)、
 * $border-thickness-* → var(--cd-border-thickness-*)、$width-icon-* → var(--cd-width-icon-*)。
 * calc / 字面量忠实保留。
 *
 * 末尾各段保留 chenzy-design 组件实际消费的补充 token（原名，Semi 无 / 命名差异；
 * 组件消费），值对齐 Semi。组件 token 名与 alias / global 层不同名，var() 无自引用死循环。
 */
import type { TokenGroup } from './token-def.js';

export const dataDisplayTokens = {
  // ============================================================
  // Empty —— semi-foundation/empty/variables.scss（6）
  // ============================================================
  'spacing-empty-content-vertical-margintop': { value: '24px', category: 'spacing', label: '内容顶部外边距', usage: '垂直布局内容顶部外边距' },
  'spacing-empty-content-horizontal-marginleft': { value: '32px', category: 'spacing', label: '内容左侧外边距', usage: '水平布局内容左侧外边距' },
  'spacing-empty-title-margintop': { value: '16px', category: 'spacing', label: '标题顶部外边距', usage: '标题内容顶部外边距' },
  'spacing-empty-footer-margintop': { value: '24px', category: 'spacing', label: '操作区顶部外边距', usage: '操作 footer 顶部外边距' },
  'font-empty-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '标题字重' },
  'color-empty-description-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '描述文字颜色', usage: '描述文字颜色' },

  // ============================================================
  // Descriptions —— semi-foundation/descriptions/variables.scss（19）
  // ============================================================
  'font-descriptions-lineheight': { value: '20px', category: 'font', label: '文字行高', usage: '文字行高' },
  'font-descriptions-value-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '双行 value 字重', usage: '双行显示 value 文字字重' },
  'spacing-descriptions-th-paddingright': { value: 'var(--cd-spacing-loose)', category: 'spacing', label: 'key 右内边距', usage: '普通显示 key 右侧内边距' },
  'spacing-descriptions-item-paddingbottom': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: 'item 底部内边距', usage: '普通显示 item 底部内边距' },
  'spacing-descriptions-item-small-paddingright': { value: '48px', category: 'spacing', label: 'item 右内边距-小', usage: '双行显示 item 右侧内边距 - 小尺寸' },
  'spacing-descriptions-item-medium-paddingright': { value: '60px', category: 'spacing', label: 'item 右内边距-中', usage: '双行显示 item 右侧内边距 - 中尺寸' },
  'spacing-descriptions-item-large-paddingright': { value: '80px', category: 'spacing', label: 'item 右内边距-大', usage: '双行显示 item 右侧内边距 - 大尺寸' },
  'spacing-descriptions-key-medium-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'key 底部内边距-中', usage: '双行显示 key 底部内边距 - 中尺寸' },
  'spacing-descriptions-key-large-paddingbottom': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: 'key 底部内边距-大', usage: '双行显示 key 底部内边距 - 大尺寸' },
  'color-descriptions-key-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: 'key 文字颜色', usage: 'key 文字颜色' },
  'color-descriptions-value-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: 'value 文字颜色', usage: 'value 文字颜色' },
  'spacing-descriptions-value-plain-paddingleft': { value: '8px', category: 'spacing', label: 'plain value 左内边距', usage: '普通显示 plain 模式下 value 左侧内边距' },
  'spacing-descriptions-item-double-padding': { value: '0', category: 'spacing', label: '双行右侧 item 内边距', usage: '双行显示右侧 item 内边距' },
  'font-descriptions-key-small-fontsize': { value: 'var(--cd-font-size-small)', category: 'font', label: 'key 字号-小', usage: '双行显示 key 文字大小 - 小尺寸' },
  'font-descriptions-value-small-fontsize': { value: 'var(--cd-font-size-header-6)', category: 'font', label: 'value 字号-小', usage: '双行显示 value 文字大小 - 小尺寸' },
  'font-descriptions-key-medium-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'key 字号-中', usage: '双行显示 key 文字大小 - 中尺寸' },
  'font-descriptions-value-medium-fontsize': { value: 'var(--cd-font-size-header-4)', category: 'font', label: 'value 字号-中', usage: '双行显示 value 文字大小 - 中尺寸' },
  'font-descriptions-key-large-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: 'key 字号-大', usage: '双行显示 key 文字大小 - 大尺寸' },
  'font-descriptions-value-large-fontsize': { value: 'var(--cd-font-size-header-2)', category: 'font', label: 'value 字号-大', usage: '双行显示 value 文字大小 - 大尺寸' },

  // ============================================================
  // Collapse —— semi-foundation/collapse/variables.scss（20）
  // ============================================================
  'color-collapse-item-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '分割线颜色', usage: '分割线颜色' },
  'color-collapse-header-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '标题文字颜色', usage: '标题文字颜色' },
  'color-collapse-header-text-disabled': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '标题文字颜色-禁用', usage: '标题文字颜色 禁用' },
  'color-collapse-header-icon-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '展开箭头颜色', usage: '展开箭头图标颜色' },
  'color-collapse-header-bg-hover': { value: 'var(--cd-color-fill-0)', category: 'color', label: '标题背景-悬浮', usage: '菜单项背景颜色 - 悬浮' },
  'color-collapse-header-bg-active': { value: 'var(--cd-color-fill-1)', category: 'color', label: '标题背景-按下', usage: '菜单项背景颜色 - 按下' },
  'color-collapse-content-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '内容文字颜色', usage: '内容文字颜色' },
  'font-collapse-header-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题字重', usage: '标题字重' },
  'spacing-collapse-header-marginx': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题水平外边距', usage: '标题水平外边距' },
  'spacing-collapse-header-marginy': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '标题垂直外边距', usage: '标题垂直外边距' },
  'spacing-collapse-header-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标题内边距', usage: '标题内边距' },
  'spacing-collapse-right-paddingright': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '图标右内边距', usage: '图标右侧内边距' },
  'spacing-collapse-header-iconleft-marginright': { value: '8px', category: 'spacing', label: '左置图标右外边距', usage: '标题左置图标右侧外边距' },
  'spacing-collapse-content-paddingtop': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '内容顶部内边距', usage: '内容顶部内边距' },
  'spacing-collapse-content-paddingright': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '内容右侧内边距', usage: '内容右侧内边距' },
  'spacing-collapse-content-paddingbottom': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '内容底部内边距', usage: '内容底部内边距' },
  'spacing-collapse-content-paddingleft': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '内容左侧内边距', usage: '内容左侧内边距' },
  'radius-collapse-header': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '标题圆角', usage: '内容圆角大小' },
  'width-collapse-item-border': { value: '1px', category: 'width', label: '分割线宽度', usage: '分割线宽度' },
  'size-collapse-icon-default': { value: 'var(--cd-width-icon-medium)', category: 'width', label: '图标尺寸', usage: '图标尺寸' },

  // ============================================================
  // Timeline —— 对齐 semi-foundation/timeline/variables.scss（仅保留组件消费）
  // ============================================================
  'radius-timeline-head': { value: 'var(--cd-border-radius-circle)', category: 'radius', label: '圆点圆角', usage: '时间轴节点圆点圆角' },

  // ============================================================
  // chenzy-design 组件实际消费的补充 token（原名保留，值对齐 Semi；组件消费）
  // ============================================================
  // —— Empty 组件直接消费上方原始层 --cd-*-empty-*（对齐 Semi empty.scss，无中间变量）——

  // —— Descriptions 组件直接消费上方原始层 --cd-*-descriptions-*（对齐 Semi descriptions.scss，无中间变量）——

  // —— Collapse 组件直接消费上方原始层 --cd-*-collapse-*（对齐 Semi collapse.scss，无中间变量）——

  // —— Collapsible（折叠容器原语，Collapse 底层能力）——
  // 镜像 Semi collapsible/animation.scss：height / opacity 各一组 transition_function/duration/delay，
  // 直接组件级值（无中间档位变量）。height 曲线用 CSS ease 等价 cubic-bezier(0.25,0.1,0.25,1)、
  // opacity 曲线引用 easeIn、delay 引用 none，与 Semi 逐值对齐。
  'transition-function-collapsible-height': { value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', category: 'animation', label: '折叠高度过渡曲线', usage: '折叠-高度-过渡曲线（组件消费，对齐 Semi $transition_function-collapsible-height）' },
  'transition-duration-collapsible-height': { value: '250ms', category: 'animation', label: '折叠高度动画时长', usage: '折叠-高度-动画持续时间默认值（可被 duration prop 覆盖，组件消费，对齐 Semi $transition_duration-collapsible-height）' },
  'transition-delay-collapsible-height': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '折叠高度过渡延迟', usage: '折叠-高度-延迟时间（组件消费，对齐 Semi $transition_delay-collapsible-height）' },
  'transition-function-collapsible-opacity': { value: 'var(--cd-motion-ease-in)', category: 'animation', label: '折叠透明度过渡曲线', usage: '折叠-透明度-过渡曲线（组件消费，对齐 Semi $transition_function-collapsible-opacity）' },
  'transition-duration-collapsible-opacity': { value: '250ms', category: 'animation', label: '折叠透明度动画时长', usage: '折叠-透明度-动画持续时间（组件消费，对齐 Semi $transition_duration-collapsible-opacity）' },
  'transition-delay-collapsible-opacity': { value: 'var(--cd-motion-delay-none)', category: 'animation', label: '折叠透明度过渡延迟', usage: '折叠-透明度-延迟时间（组件消费，对齐 Semi $transition_delay-collapsible-opacity）' },

  // —— Timeline ——
  'timeline-dot-size': { value: '9px', category: 'width', label: '圆点尺寸', usage: '圆点尺寸（组件消费，对齐 Semi 9px）' },
  'timeline-dot-color': { value: 'var(--cd-color-primary)', category: 'color', label: '圆点颜色', usage: '默认圆点颜色 - 进行中（组件消费）' },
  'timeline-dot-color-success': { value: 'var(--cd-color-success)', category: 'color', label: '圆点颜色-成功', usage: '成功态圆点颜色（组件消费）' },
  'timeline-dot-color-warning': { value: 'var(--cd-color-warning)', category: 'color', label: '圆点颜色-警告', usage: '警告态圆点颜色（组件消费）' },
  'timeline-dot-color-error': { value: 'var(--cd-color-danger)', category: 'color', label: '圆点颜色-错误', usage: '错误态圆点颜色（组件消费）' },
  'timeline-dot-color-ongoing': { value: 'var(--cd-color-primary)', category: 'color', label: '圆点颜色-进行中', usage: '进行中态圆点颜色（组件消费）' },
  'timeline-line-color': { value: 'var(--cd-color-text-3)', category: 'color', label: '连线颜色', usage: '连线颜色（组件消费，对齐 Semi text-3）' },
  'timeline-content-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '内容颜色', usage: '内容文字颜色（组件消费）' },
  'timeline-time-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '时间文字颜色', usage: '时间文字颜色（组件消费）' },
  'timeline-gap': { value: 'var(--cd-spacing-base)', category: 'spacing', label: '间距', usage: '节点内容间距（组件消费）' },
} satisfies TokenGroup;
