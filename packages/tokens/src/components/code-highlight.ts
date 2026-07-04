/**
 * Component tokens for CodeHighlight (show). 语法高亮容器 + Prism token 分类配色。
 * 全部 var() 引用 alias/global（禁写死色值），暗色由 alias 层自动切换。
 * Prism token 分类（comment/keyword/string/number/function/operator/punctuation/
 * variable）映射到语义色：
 *   comment → tertiary(灰)   keyword/atrule → primary(蓝)   string/selector → success(绿)
 *   number/tag/boolean → warning(橙)   function/class → secondary(青)
 *   operator/punctuation → text   variable/regex → danger(红)
 * 与 Semi 对齐的意图：注释淡、关键字主色、字符串绿、数字暖色，明暗均满足正文对比。
 */
import type { TokenGroup } from './token-def.js';

export const codeHighlightTokens = {
  // —— 容器 ——
  'code-highlight-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '代码块背景', usage: '代码块背景色' },
  'code-highlight-color': { value: 'var(--cd-color-text-0)', category: 'color', label: '代码前景色', usage: '普通字符/无 token 文本色' },
  'code-highlight-radius': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '圆角', usage: '代码块圆角' },
  'code-highlight-padding': { value: 'var(--cd-spacing-base-tight)', category: 'spacing', label: '内边距', usage: '代码块内边距' },
  'code-highlight-font-family': { value: 'var(--cd-font-family-code)', category: 'font', label: '字体族', usage: '等宽代码字体' },
  'code-highlight-font-size': { value: 'var(--cd-font-size-small)', category: 'font', label: '字号', usage: '代码字号' },
  'code-highlight-line-height': { value: 'var(--cd-line-height-regular)', category: 'font', label: '行高', usage: '代码行高' },

  // —— Prism token 分类配色 ——
  'code-highlight-token-comment': { value: 'var(--cd-color-text-2)', category: 'color', label: '注释色', usage: 'comment/prolog/doctype/cdata' },
  'code-highlight-token-punctuation': { value: 'var(--cd-color-text-1)', category: 'color', label: '标点色', usage: 'punctuation' },
  'code-highlight-token-keyword': { value: 'var(--cd-color-primary)', category: 'color', label: '关键字色', usage: 'keyword/atrule/attr-value' },
  'code-highlight-token-string': { value: 'var(--cd-color-success)', category: 'color', label: '字符串色', usage: 'string/char/selector/attr-name/inserted' },
  'code-highlight-token-number': { value: 'var(--cd-color-warning)', category: 'color', label: '数字/标签色', usage: 'number/boolean/tag/property/constant/symbol' },
  'code-highlight-token-function': { value: 'var(--cd-color-secondary)', category: 'color', label: '函数/类名色', usage: 'function/class-name' },
  'code-highlight-token-operator': { value: 'var(--cd-color-text-1)', category: 'color', label: '运算符色', usage: 'operator/entity/url' },
  'code-highlight-token-variable': { value: 'var(--cd-color-danger)', category: 'color', label: '变量/正则色', usage: 'variable/regex/important' },
  'code-highlight-token-bold-weight': { value: 'var(--cd-font-weight-bold)', category: 'font', label: '加粗字重', usage: 'important/bold token 字重' },

  // —— 行号插件 ——
  'code-highlight-linenumber-color': { value: 'var(--cd-color-text-3)', category: 'color', label: '行号色', usage: '行号数字颜色' },
  'code-highlight-linenumber-border': { value: 'var(--cd-color-border)', category: 'color', label: '行号分隔线', usage: '行号列右侧分隔线' },
  'code-highlight-linenumber-width': { value: '3.5em', category: 'width', label: '行号列宽', usage: '行号列占位宽度' },
  'code-highlight-linenumber-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '行号右间距', usage: '行号数字与代码间距' },
} satisfies TokenGroup;
