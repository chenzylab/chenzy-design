/**
 * Machine-readable component metadata for AI/docs consumption.
 * CodeHighlight — see specs/components/show/CodeHighlight.spec.md
 */
export const meta = {
  name: 'CodeHighlight',
  category: 'show',
  description:
    '代码语法高亮：底层用 prismjs（对齐 Semi Design），给 <code> 元素加 language-<lang> class 后 Prism.highlightElement 就地高亮，仅写纯文本节点规避 XSS（不用 {@html} 拼未处理内容）。支持 lineNumber 行号、defaultTheme 内置 token 驱动配色开关。语言包按需由使用方 import "prismjs/components/prism-<lang>.js"。长代码块可滚动、可键盘聚焦，role=region + i18n aria-label。',
  exports: ['CodeHighlight', 'resolveCodeClassName'],
  props: [
    { name: 'code', type: 'string', default: "''", desc: '源码文本；作为 textContent 写入，不解析 HTML' },
    {
      name: 'language',
      type: 'string',
      default: "'markup'",
      desc: 'Prism 语言 id（js/ts/css/markup…）；非内置语言需使用方先 import 对应 prismjs 语言包',
    },
    { name: 'lineNumber', type: 'boolean', default: 'true', desc: '显示行号（Prism line-numbers 插件）' },
    {
      name: 'defaultTheme',
      type: 'boolean',
      default: 'true',
      desc: 'true 套用内置 token 驱动配色；false 仅结构，配色交给使用方',
    },
    { name: 'class', type: 'string', default: "''", desc: '根 <pre> 附加类名' },
    { name: 'style', type: 'string', default: "''", desc: '根 <pre> 内联样式' },
  ],
  events: [],
  slots: [],
  a11y: {
    hasRole: true,
    focusable: true,
    note: '根 <pre> 为 role=region 命名的滚动区（aria-label 走 i18n CodeHighlight.codeBlock），tabindex=0 让长代码块可键盘滚动聚焦（WCAG 2.1.1）；无交互控件、不夺焦、不锁滚。',
  },
  tokens: [
    '--cd-code-highlight-bg',
    '--cd-code-highlight-color',
    '--cd-code-highlight-radius',
    '--cd-code-highlight-padding',
    '--cd-code-highlight-font-family',
    '--cd-code-highlight-font-size',
    '--cd-code-highlight-line-height',
    '--cd-code-highlight-token-comment',
    '--cd-code-highlight-token-punctuation',
    '--cd-code-highlight-token-keyword',
    '--cd-code-highlight-token-string',
    '--cd-code-highlight-token-number',
    '--cd-code-highlight-token-function',
    '--cd-code-highlight-token-operator',
    '--cd-code-highlight-token-variable',
    '--cd-code-highlight-token-bold-weight',
    '--cd-code-highlight-linenumber-color',
    '--cd-code-highlight-linenumber-border',
    '--cd-code-highlight-linenumber-width',
    '--cd-code-highlight-linenumber-gap',
  ],
  responsive: false,
  examples: [
    {
      title: '基础 JS 高亮',
      code: "<CodeHighlight language=\"js\" code={`const a = 1;\\nconsole.log(a);`} />",
    },
    {
      title: '关闭行号',
      code: '<CodeHighlight language="css" lineNumber={false} code={`.a { color: red; }`} />',
    },
    {
      title: '无默认主题（自定义配色）',
      code: '<CodeHighlight language="ts" defaultTheme={false} code={sourceCode} />',
    },
  ],
} as const;
