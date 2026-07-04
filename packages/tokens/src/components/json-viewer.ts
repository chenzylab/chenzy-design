/**
 * Component tokens for JsonViewer (M4 富媒体 · show).
 *
 * 底层用 Semi 自研内核 `@douyinfe/semi-json-viewer-core`；Semi 无对应
 * variables.scss（内核样式由消费方自行提供），故本表为 chenzy-design 自有 token，
 * 值全部回退 alias / 语义 token（禁写死），深浅双主题由 alias 层自动切换。
 *
 * token 目标 class 已核对内核实际输出（prefixCls='cd-json-viewer'）：
 *   语法着色 span：`.cd-json-viewer-<token.scopes>`，scopes 取值——
 *     string-key（键名）/ string-value（字符串值）/ number（数字）/
 *     keyword（布尔 + null 共用此 scope，内核无法区分）/
 *     delimiter-bracket|delimiter-array|delimiter-colon|delimiter-comma（标点）/
 *     comment-block|comment-line（注释）
 *   结构：`.cd-json-viewer-line-number`（行号）/ `-line-number-container`（行号列）/
 *     `-content-container` / `-view-line` / `-search-result`（命中）/
 *     `-current-search-result`（当前命中）/ `-error`（错误行）/ `-folding-icon`
 *
 * 注：spec §5 表内 boolean 与 null 分列不同颜色，但内核把二者归一为同一
 *   `keyword` scope（TOKEN_VALUE_BOOLEAN === TOKEN_VALUE_NULL === "keyword"），
 *   无法按 class 拆分 → 二者共用 `--cd-color-json-viewer-keyword`（记为对 spec 的偏离）。
 */
import type { TokenGroup } from './token-def.js';

export const jsonViewerTokens = {
  // —— 容器 ——
  'color-json-viewer-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '背景', usage: '编辑器容器背景' },
  'color-json-viewer-text': { value: 'var(--cd-color-text-0)', category: 'color', label: '默认文字', usage: '编辑器默认文字色（标点等未着色内容）' },
  'radius-json-viewer': { value: 'var(--cd-border-radius-medium)', category: 'radius', label: '圆角', usage: '编辑器容器圆角' },
  'color-json-viewer-border': { value: 'var(--cd-color-border)', category: 'color', label: '边框', usage: '编辑器容器边框色' },
  'font-json-viewer-fontsize': { value: 'var(--cd-font-size-regular)', category: 'font', label: '字号', usage: '编辑器文本字号' },
  'font-json-viewer-fontfamily': { value: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace", category: 'font', label: '字体', usage: '编辑器等宽字体' },

  // —— JSON 语法着色（对齐内核 token.scopes class） ——
  'color-json-viewer-key': { value: 'var(--cd-color-primary)', category: 'color', label: '键名', usage: 'string-key：对象键名' },
  'color-json-viewer-string': { value: 'var(--cd-color-success)', category: 'color', label: '字符串', usage: 'string-value：字符串值' },
  'color-json-viewer-number': { value: 'var(--cd-color-warning)', category: 'color', label: '数字', usage: 'number：数字值' },
  'color-json-viewer-keyword': { value: 'var(--cd-color-link)', category: 'color', label: '布尔/null', usage: 'keyword：布尔与 null（内核归一同一 scope）' },
  'color-json-viewer-punctuation': { value: 'var(--cd-color-text-2)', category: 'color', label: '标点', usage: 'delimiter-*：括号/逗号/冒号等标点' },
  'color-json-viewer-comment': { value: 'var(--cd-color-text-3)', category: 'color', label: '注释', usage: 'comment-*：JSONC 注释' },

  // —— 行号列 ——
  'color-json-viewer-line-number': { value: 'var(--cd-color-text-3)', category: 'color', label: '行号', usage: 'line-number：行号文字色' },
  'color-json-viewer-line-number-bg': { value: 'var(--cd-color-fill-0)', category: 'color', label: '行号列背景', usage: 'line-number-container：行号列背景' },

  // —— 搜索命中 ——
  'color-json-viewer-search-highlight': { value: 'var(--cd-color-warning-light-default)', category: 'color', label: '搜索命中背景', usage: 'search-result：搜索命中底色' },
  'color-json-viewer-search-current': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '当前命中背景', usage: 'current-search-result：当前命中底色' },

  // —— 错误行 ——
  'color-json-viewer-error': { value: 'var(--cd-color-danger)', category: 'color', label: '错误提示', usage: 'error：语法错误提示色' },

  // —— 自研搜索/替换工具条（Svelte 壳自渲染，内核仅提供 API；对齐 Semi 交互） ——
  'color-json-viewer-toolbar-bg': { value: 'var(--cd-color-bg-0)', category: 'color', label: '工具条背景', usage: '搜索/替换工具条背景' },
  'color-json-viewer-toolbar-border': { value: 'var(--cd-color-border)', category: 'color', label: '工具条边框', usage: '搜索/替换工具条边框' },
  'color-json-viewer-toolbar-shadow': { value: 'var(--cd-shadow-elevated)', category: 'other', label: '工具条阴影', usage: '搜索/替换工具条浮层阴影' },
  'radius-json-viewer-toolbar': { value: 'var(--cd-border-radius-small)', category: 'radius', label: '工具条圆角', usage: '搜索/替换工具条圆角' },
  'spacing-json-viewer-toolbar-gap': { value: 'var(--cd-spacing-extra-tight)', category: 'spacing', label: '工具条间距', usage: '工具条控件间距' },
  'spacing-json-viewer-toolbar-padding': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '工具条内边距', usage: '工具条内边距' },
  'color-json-viewer-toolbar-btn-hover': { value: 'var(--cd-color-fill-1)', category: 'color', label: '工具按钮悬浮', usage: '工具条按钮悬浮背景' },
  'color-json-viewer-toolbar-btn-active': { value: 'var(--cd-color-primary-light-default)', category: 'color', label: '工具按钮激活', usage: '搜索选项激活态背景' },
} satisfies TokenGroup;
