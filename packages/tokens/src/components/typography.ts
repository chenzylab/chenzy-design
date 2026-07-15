/**
 * Component tokens for Typography. 严格对齐 Semi Design
 * （semi-foundation/typography/variables.scss，全 77 项），无自造中间变量、无向后兼容。
 *
 * 命名：Semi `$` 变量名去 `$`、`_`→`-`（词组分隔）、camelCase 段全小写化
 *   （fontWeight→fontweight / lineHeight→lineheight / marginRight→marginright /
 *    iconPrefix→iconprefix / title_h1→title-h1 / paragraph_extended→paragraph-extended）。
 *   emit 时不加 category 前缀，直接得 `--cd-<name>`。SCSS（TypographyBase.svelte <style>）
 *   直接 `var(--cd-<name>)` 消费，token 名与消费名一一对应。
 *
 * 值：Semi `var(--semi-color-x)` → `var(--cd-color-x)`；`$font-weight-bold`/`-regular` →
 *   `var(--cd-font-weight-bold)`/`-regular`；title 字重档为 Semi 硬编码字面量（200/400/500/600/700）。
 */
import type { TokenGroup } from './token-def.js';

export const typographyTokens = {
  // —— 文本语义色（Semi $color-typography_*-text-default）——
  'color-typography-default-text-default': { value: 'var(--cd-color-text-0)', category: 'color', label: '默认文本颜色', usage: '默认文本颜色' },
  'color-typography-secondary-text-default': { value: 'var(--cd-color-text-1)', category: 'color', label: '稍次要文本颜色', usage: '稍次要文本颜色' },
  'color-typography-tertiary-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '次要文本颜色', usage: '次要文本颜色' },
  'color-typography-quaternary-text-default': { value: 'var(--cd-color-text-3)', category: 'color', label: '最次要文本颜色', usage: '最次要文本颜色' },
  'color-typography-warning-text-default': { value: 'var(--cd-color-warning)', category: 'color', label: '警告文本颜色', usage: '警告文本颜色' },
  'color-typography-danger-text-default': { value: 'var(--cd-color-danger)', category: 'color', label: '错误文本颜色', usage: '错误文本颜色' },
  'color-typography-success-text-default': { value: 'var(--cd-color-success)', category: 'color', label: '成功文本颜色', usage: '成功文本颜色' },

  'color-typography-disabled-text-default': { value: 'var(--cd-color-disabled-text)', category: 'color', label: '禁用文本颜色', usage: '禁用文本颜色' },
  'color-typography-mark-bg-default': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '标记文本背景颜色', usage: '标记文本背景颜色' },
  'color-typography-code-bg-default': { value: 'var(--cd-color-fill-1)', category: 'color', label: '代码文本背景颜色', usage: '代码文本背景颜色' },
  'color-typography-code-text-default': { value: 'var(--cd-color-text-2)', category: 'color', label: '代码文本颜色', usage: '代码文本颜色' },

  // —— 链接色 ——
  'color-typography-link-text-default': { value: 'var(--cd-color-link)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 默认' },
  'color-typography-link-text-visited': { value: 'var(--cd-color-link-visited)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 已访问' },
  'color-typography-link-text-hover': { value: 'var(--cd-color-link-hover)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 悬浮' },
  'color-typography-link-text-active': { value: 'var(--cd-color-link-active)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 激活' },
  'color-typography-link-text-disabled': { value: 'var(--cd-color-link)', category: 'color', label: '链接文本颜色', usage: '链接文本颜色 - 禁用' },

  // —— 复制 ——
  'color-typography-copied-text-success': { value: 'var(--cd-color-text-2)', category: 'color', label: '可复制文本颜色', usage: '可复制文本颜色' },
  'color-typography-copied-icon-success': { value: 'var(--cd-color-success)', category: 'color', label: '可复制文本复制成功图标颜色', usage: '可复制文本复制成功图标颜色' },
  'color-typography-code-border-default': { value: 'var(--cd-color-border)', category: 'color', label: '代码文本描边颜色', usage: '代码文本描边颜色' },

  // —— 字重（基础组）——
  'font-typography-title-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '标题文本字重', usage: '标题文本字重' },
  'font-typography-link-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '链接文本字重', usage: '链接文本字重' },
  'font-typography-strong-fontweight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '强调文本字重', usage: '强调文本字重' },
  'font-typography-paragraph-extended-lineheight': { value: '24px', category: 'font', label: '宽松行距段落文本行高', usage: '宽松行距段落文本行高' },
  'font-typography-normaltext-regular-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: 'normal text 字重 - 正常', usage: 'normal text 字重 - 正常' },
  'font-typography-smalltext-regular-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: 'small text 字重 - 正常', usage: 'small text 字重 - 正常' },
  'font-typography-normalparagraph-regular-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: 'normal paragraph 字重 - 正常', usage: 'normal paragraph 字重 - 正常' },
  'font-typography-smallparagraph-regular-fontweight': { value: 'var(--cd-font-weight-regular)', category: 'font', label: 'small paragraph 字重 - 正常', usage: 'small paragraph 字重 - 正常' },

  // —— 标题字重（title1..6 默认 = 引用同组 title 字重）——
  'font-typography-title1-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '一级标题文本字重', usage: '一级标题文本字重' },
  'font-typography-title2-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '二级标题文本字重', usage: '二级标题文本字重' },
  'font-typography-title3-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '三级标题文本字重', usage: '三级标题文本字重' },
  'font-typography-title4-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '四级标题文本字重', usage: '四级标题文本字重' },
  'font-typography-title5-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '五级标题文本字重', usage: '五级标题文本字重' },
  'font-typography-title6-fontweight': { value: 'var(--cd-font-typography-title-fontweight)', category: 'font', label: '六级标题文本字重', usage: '六级标题文本字重' },

  // 标题字重 - 细（light = 200）
  'font-typography-title1-light-fontweight': { value: '200', category: 'font', label: '一级标题文本字重 - 细', usage: '一级标题文本字重 - 细' },
  'font-typography-title2-light-fontweight': { value: '200', category: 'font', label: '二级标题文本字重 - 细', usage: '二级标题文本字重 - 细' },
  'font-typography-title3-light-fontweight': { value: '200', category: 'font', label: '三级标题文本字重 - 细', usage: '三级标题文本字重 - 细' },
  'font-typography-title4-light-fontweight': { value: '200', category: 'font', label: '四级标题文本字重 - 细', usage: '四级标题文本字重 - 细' },
  'font-typography-title5-light-fontweight': { value: '200', category: 'font', label: '五级标题文本字重 - 细', usage: '五级标题文本字重 - 细' },
  'font-typography-title6-light-fontweight': { value: '200', category: 'font', label: '六级标题文本字重 - 细', usage: '六级标题文本字重 - 细' },

  // 标题字重 - 正常（regular = 400）
  'font-typography-title1-regular-fontweight': { value: '400', category: 'font', label: '一级标题文本字重 - 正常', usage: '一级标题文本字重 - 正常' },
  'font-typography-title2-regular-fontweight': { value: '400', category: 'font', label: '二级标题文本字重 - 正常', usage: '二级标题文本字重 - 正常' },
  'font-typography-title3-regular-fontweight': { value: '400', category: 'font', label: '三级标题文本字重 - 正常', usage: '三级标题文本字重 - 正常' },
  'font-typography-title4-regular-fontweight': { value: '400', category: 'font', label: '四级标题文本字重 - 正常', usage: '四级标题文本字重 - 正常' },
  'font-typography-title5-regular-fontweight': { value: '400', category: 'font', label: '五级标题文本字重 - 正常', usage: '五级标题文本字重 - 正常' },
  'font-typography-title6-regular-fontweight': { value: '400', category: 'font', label: '六级标题文本字重 - 正常', usage: '六级标题文本字重 - 正常' },

  // 标题字重 - 中等（medium = 500）
  'font-typography-title1-medium-fontweight': { value: '500', category: 'font', label: '一级标题文本字重 - 中等', usage: '一级标题文本字重 - 中等' },
  'font-typography-title2-medium-fontweight': { value: '500', category: 'font', label: '二级标题文本字重 - 中等', usage: '二级标题文本字重 - 中等' },
  'font-typography-title3-medium-fontweight': { value: '500', category: 'font', label: '三级标题文本字重 - 中等', usage: '三级标题文本字重 - 中等' },
  'font-typography-title4-medium-fontweight': { value: '500', category: 'font', label: '四级标题文本字重 - 中等', usage: '四级标题文本字重 - 中等' },
  'font-typography-title5-medium-fontweight': { value: '500', category: 'font', label: '五级标题文本字重 - 中等', usage: '五级标题文本字重 - 中等' },
  'font-typography-title6-medium-fontweight': { value: '500', category: 'font', label: '六级标题文本字重 - 中等', usage: '六级标题文本字重 - 中等' },

  // 标题字重 - 半粗（semibold = 600）
  'font-typography-title1-semibold-fontweight': { value: '600', category: 'font', label: '一级标题文本字重 - 半粗', usage: '一级标题文本字重 - 半粗' },
  'font-typography-title2-semibold-fontweight': { value: '600', category: 'font', label: '二级标题文本字重 - 半粗', usage: '二级标题文本字重 - 半粗' },
  'font-typography-title3-semibold-fontweight': { value: '600', category: 'font', label: '三级标题文本字重 - 半粗', usage: '三级标题文本字重 - 半粗' },
  'font-typography-title4-semibold-fontweight': { value: '600', category: 'font', label: '四级标题文本字重 - 半粗', usage: '四级标题文本字重 - 半粗' },
  'font-typography-title5-semibold-fontweight': { value: '600', category: 'font', label: '五级标题文本字重 - 半粗', usage: '五级标题文本字重 - 半粗' },
  'font-typography-title6-semibold-fontweight': { value: '600', category: 'font', label: '六级标题文本字重 - 半粗', usage: '六级标题文本字重 - 半粗' },

  // 标题字重 - 粗（bold = 700，Semi 硬编码字面量）
  'font-typography-title1-bold-fontweight': { value: '700', category: 'font', label: '一级标题文本字重 - 粗', usage: '一级标题文本字重 - 粗' },
  'font-typography-title2-bold-fontweight': { value: '700', category: 'font', label: '二级标题文本字重 - 粗', usage: '二级标题文本字重 - 粗' },
  'font-typography-title3-bold-fontweight': { value: '700', category: 'font', label: '三级标题文本字重 - 粗', usage: '三级标题文本字重 - 粗' },
  'font-typography-title4-bold-fontweight': { value: '700', category: 'font', label: '四级标题文本字重 - 粗', usage: '四级标题文本字重 - 粗' },
  'font-typography-title5-bold-fontweight': { value: '700', category: 'font', label: '五级标题文本字重 - 粗', usage: '五级标题文本字重 - 粗' },
  'font-typography-title6-bold-fontweight': { value: '700', category: 'font', label: '六级标题文本字重 - 粗', usage: '六级标题文本字重 - 粗' },

  // —— 间距 ——
  'spacing-typography-iconprefix-marginright': { value: '4px', category: 'spacing', label: '带前缀文本图标右侧外边距', usage: '带前缀文本图标右侧外边距' },
  'spacing-typography-expandtext-marginleft': { value: '8px', category: 'spacing', label: '支持展开文本展开按钮左侧外边距', usage: '支持展开文本展开按钮左侧外边距' },
  'spacing-typography-copyicon-marginleft': { value: '4px', category: 'spacing', label: '可复制文本复制图标左侧外边距', usage: '可复制文本复制图标左侧外边距' },
  'spacing-typography-copyicon-padding': { value: '0', category: 'spacing', label: '可复制文本复制图标内边距', usage: '可复制文本复制图标内边距' },
  'spacing-typography-title-h1-margin': { value: '0', category: 'spacing', label: '一级标题外边距', usage: '一级标题外边距' },
  'spacing-typography-title-h2-margin': { value: '0', category: 'spacing', label: '二级标题外边距', usage: '二级标题外边距' },
  'spacing-typography-title-h3-margin': { value: '0', category: 'spacing', label: '三级标题外边距', usage: '三级标题外边距' },
  'spacing-typography-title-h4-margin': { value: '0', category: 'spacing', label: '四级标题外边距', usage: '四级标题外边距' },
  'spacing-typography-title-h5-margin': { value: '0', category: 'spacing', label: '五级标题外边距', usage: '五级标题外边距' },
  'spacing-typography-title-h6-margin': { value: '0', category: 'spacing', label: '六级标题外边距', usage: '六级标题外边距' },
  'spacing-typography-title-paragraph-margin': { value: '0', category: 'spacing', label: '段落外边距', usage: '段落外边距' },

  // —— 描边宽度 ——
  'width-typography-code-border': { value: '1px', category: 'width', label: '代码文本描边宽度', usage: '代码文本描边宽度' },
  'width-typography-link-border': { value: '1px', category: 'width', label: '链接文本下划线宽度', usage: '链接文本下划线宽度' },

  // —— 圆角 ——
  'radius-typography-code': { value: '2px', category: 'radius', label: '代码文本圆角', usage: '代码文本圆角' },
} satisfies TokenGroup;
