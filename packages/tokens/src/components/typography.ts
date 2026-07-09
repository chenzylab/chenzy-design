/**
 * Component tokens for Typography. 对齐 Semi Design
 * （semi-foundation/typography/variables.scss），仅保留组件实际消费的 token，并升级为
 * 带元数据的 TokenDef 结构以支持 DSM。值为 var() 引用我们的 alias / global token，或字面量。
 * 末尾保留 chenzy-design Typography 家族实际消费的补充 token（Semi 无；组件消费）。
 *
 * 命名：Semi `$color-typography-*` kebab 化（去 `$`，camelCase 段小写：
 * fontWeight→fontweight / lineHeight→lineheight / marginRight→marginright 等），
 * emit 时不加 category 前缀，直接得 `--cd-<name>`。
 *
 * alias 映射：`--semi-color-*` → `--cd-color-*`；Semi 的 `$font-weight-bold` /
 * `$font-weight-regular` → `--cd-font-weight-bold` / `--cd-font-weight-regular`；
 * title1..6 的字重自引用 `$font-typography-title-fontWeight` → 引用同组
 * `--cd-font-typography-title-fontweight`（非自身自引用，合法）。
 */
import type { TokenGroup } from './token-def.js';

export const typographyTokens = {
  // —— 文本语义色 ——
  'color-typography-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告文本颜色', usage: '警告文本颜色' },
  'color-typography-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '错误文本颜色', usage: '错误文本颜色' },
  'color-typography-success-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '成功文本颜色', usage: '成功文本颜色' },


  // —— 链接色 ——
  'color-typography-link-text-default': { value: 'var(--cd-color-link)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 默认' },
  'color-typography-link-text-hover': { value: 'var(--cd-color-link-hover)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 悬浮' },

  // —— 操作图标（复制/展开等按钮） ——
  'typography-action-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '操作图标颜色', usage: '复制/展开等操作图标按钮默认色' },
  'typography-action-color-hover': { value: 'var(--cd-color-primary)', category: 'color', label: '操作图标悬浮颜色', usage: '复制/展开等操作图标按钮悬浮色' },

  // —— 复制 ——
  'color-typography-copied-icon-success': { value: 'var(--cd-color-success)', category: 'color', label: '可复制文本复制成功图标颜色', usage: '可复制文本复制成功图标颜色' },
  'color-typography-code-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '代码文本描边颜色', usage: '代码文本描边颜色' },

  // —— 字重（基础组） ——
  'font-typography-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题文本字重', usage: '标题文本字重' },
  'font-typography-strong-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '强调文本字重', usage: '强调文本字重' },
  'font-typography-paragraph_extended-lineheight': { value: '24px', category: 'font', label: '宽松行距段落文本行高', usage: '宽松行距段落文本行高' },

  // —— 间距 ——
  'spacing-typography-expandtext-marginleft': { value: '8px', category: 'spacing', label: '支持展开文本展开按钮左侧外边距', usage: '支持展开文本展开按钮左侧外边距' },
  'spacing-typography-copyicon-marginleft': { value: '4px', category: 'spacing', label: '可复制文本复制图标左侧外边距', usage: '可复制文本复制图标左侧外边距' },
  'spacing-typography-title_h1-margin': { value: '0', category: 'spacing', label: '一级标题外边距', usage: '一级标题外边距' },
  'spacing-typography-title_h2-margin': { value: '0', category: 'spacing', label: '二级标题外边距', usage: '二级标题外边距' },
  'spacing-typography-title_h3-margin': { value: '0', category: 'spacing', label: '三级标题外边距', usage: '三级标题外边距' },
  'spacing-typography-title_h4-margin': { value: '0', category: 'spacing', label: '四级标题外边距', usage: '四级标题外边距' },
  'spacing-typography-title_h5-margin': { value: '0', category: 'spacing', label: '五级标题外边距', usage: '五级标题外边距' },
  'spacing-typography-title_h6-margin': { value: '0', category: 'spacing', label: '六级标题外边距', usage: '六级标题外边距' },
  'spacing-typography-title_paragraph-margin': { value: '0', category: 'spacing', label: '段落外边距', usage: '段落外边距' },

  // —— 描边宽度 ——
  'width-typography-code-border': { value: '1px', category: 'width', label: '代码文本描边宽度', usage: '代码文本描边宽度' },

  // —— 圆角 ——
  'radius-typography-code': { value: '2px', category: 'radius', label: '代码文本圆角', usage: '代码文本圆角' },

  // —— chenzy-design Typography 家族实际消费的补充 token（Semi 无；组件消费；名称保留） ——
  'typography-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '默认文本色', usage: '文本默认色（组件消费）' },
  'typography-color-secondary': { value: 'var(--cd-color-text-1)', category: 'color', label: '次要文本色', usage: 'type=secondary 文本色（组件消费）' },
  'typography-color-tertiary': { value: 'var(--cd-color-text-2)', category: 'color', label: '三级文本色', usage: 'type=tertiary 文本色（组件消费）' },
  'typography-color-quaternary': { value: 'var(--cd-color-text-3)', category: 'color', label: '四级文本色', usage: 'type=quaternary 文本色（组件消费）' },
  'typography-color-link': { value: 'var(--cd-color-typography-link-text-default)', category: 'color', label: '链接色', usage: '链接默认色（组件消费）' },
  'typography-color-link-hover': { value: 'var(--cd-color-typography-link-text-hover)', category: 'color', label: '链接悬浮色', usage: '链接悬浮色（组件消费）' },
  'typography-mark-bg': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '标记背景色', usage: 'mark 高亮背景（组件消费）' },
  'typography-code-bg': { value: 'var(--cd-color-fill-1)', category: 'color', label: '代码背景色', usage: 'code 背景（组件消费）' },
  'typography-code-color': { value: 'var(--cd-color-text-2)', category: 'color', label: '代码文本色', usage: 'code 文本色（组件消费）' },
  'typography-code-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '代码字号', usage: 'code 字号（组件消费）' },
  'typography-font-size-small': { value: 'var(--cd-font-size-small)', category: 'font', label: '小号字号', usage: 'size=small 字号（组件消费）' },
  'typography-font-size-large': { value: 'var(--cd-font-size-header-6)', category: 'font', label: '大号字号', usage: 'size=large 字号（组件消费）' },
  'typography-spacing-extended': { value: '1.8', category: 'other', label: '段落宽松行距', usage: 'Paragraph spacing=extended 行高（对齐 Semi）' },
} satisfies TokenGroup;
