// 文档站 UI 框架文案中英字典。组件内容（brief/description/正文）不在此，
// brief 由 component-briefs.ts 单独维护；正文暂保持中文。
import type { Lang } from './locale.svelte';

type Dict = Record<string, { zh: string; en: string }>;

const dict: Dict = {
  // 顶栏 / 导航
  'nav.components': { zh: '组件', en: 'Components' },
  'nav.search': { zh: '搜索', en: 'Search' },
  'search.placeholder': { zh: '搜索组件...', en: 'Search components...' },
  'search.empty': { zh: '未找到相关结果', en: 'No results found' },

  // 侧栏分组
  'group.start': { zh: '开始', en: 'Getting Started' },
  'group.experience': { zh: '体验增强', en: 'Experience' },
  'cat.basic': { zh: '基础', en: 'Basic' },
  'cat.input': { zh: '输入', en: 'Input' },
  'cat.navigation': { zh: '导航', en: 'Navigation' },
  'cat.show': { zh: '展示', en: 'Show' },
  'cat.feedback': { zh: '反馈', en: 'Feedback' },
  'cat.other': { zh: '其他', en: 'Others' },

  // 组件详情页
  'tab.api': { zh: 'API 文档', en: 'API' },
  'tab.design': { zh: '设计文档', en: 'Design' },
  'tab.usage': { zh: '使用场景', en: 'Usage' },
  'section.install': { zh: '如何引入', en: 'Import' },
  'section.demo': { zh: '代码演示', en: 'Demos' },
  'section.api': { zh: 'API 参考', en: 'API Reference' },
  'section.subapi': { zh: '子组件', en: 'Sub-components' },
  'section.a11y': { zh: 'Accessibility', en: 'Accessibility' },
  'section.content': { zh: '文案规范', en: 'Content Guidelines' },
  'section.tokens': { zh: '设计变量', en: 'Design Tokens' },
  'section.faq': { zh: 'FAQ', en: 'FAQ' },
  'toc.title': { zh: '本页目录', en: 'On this page' },
  // Accessibility 区
  'a11y.role': { zh: 'ARIA role', en: 'ARIA role' },
  'a11y.keyboard': { zh: '键盘交互', en: 'Keyboard' },
  'a11y.notes': { zh: '说明', en: 'Notes' },
  'a11y.apg': { zh: '参考 WAI-ARIA APG 模式', en: 'See WAI-ARIA APG pattern' },
  // 文案规范区
  'content.usage': { zh: '使用建议', en: 'Usage' },
  'content.danger': { zh: '危险操作', en: 'Dangerous actions' },
  'content.related': { zh: '相关组件', en: 'Related components' },
  'content.guideLink': {
    zh: '更多通用文案规范见',
    en: 'For general content guidelines, see',
  },
  'content.guideLinkText': { zh: '文案规范指南', en: 'Content Guidelines' },
  // 设计变量表格
  'token.var': { zh: '变量', en: 'Variable' },
  'token.value': { zh: '默认值', en: 'Default' },
  'token.usage': { zh: '用法', en: 'Usage' },
  'token.empty': { zh: '该组件暂无专属设计变量。', en: 'No component-specific design tokens.' },
  'token.scopeComponent': { zh: '组件变量', en: 'Component' },
  'token.scopeGlobal': { zh: '全局变量', en: 'Global' },
  'token.range': {
    zh: '显示第 {from} 条-第 {to} 条，共 {total} 条',
    en: 'Showing {from}-{to} of {total}',
  },
  // FAQ 区
  'faq.empty': { zh: '暂无常见问题。', en: 'No FAQ yet.' },
  'design.openInNew': { zh: '设计文档（新窗口打开）', en: 'Design docs (opens in new tab)' },
  'demo.interactive': { zh: '交互演示（可调试）', en: 'Interactive (playground)' },
  'demo.viewSource': { zh: '查看源码', en: 'View source' },
  'demo.hideSource': { zh: '收起代码', en: 'Hide source' },
  'demo.copy': { zh: '复制', en: 'Copy' },
  'demo.copied': { zh: '已复制', en: 'Copied' },
  'usage.empty': { zh: '暂无使用场景文档。', en: 'No usage documentation yet.' },

  // API 表表头
  'api.props': { zh: 'Props', en: 'Props' },
  'api.events': { zh: 'Events', en: 'Events' },
  'api.slots': { zh: 'Slots', en: 'Slots' },
  'api.name': { zh: '属性', en: 'Name' },
  'api.type': { zh: '类型', en: 'Type' },
  'api.default': { zh: '默认值', en: 'Default' },
  'api.desc': { zh: '说明', en: 'Description' },
  'api.event': { zh: '事件', en: 'Event' },
  'api.slot': { zh: '插槽', en: 'Slot' },
  'api.payload': { zh: '载荷', en: 'Payload' },
  'api.slotName': { zh: '名称', en: 'Name' },
  'token.prefix': { zh: 'Token 前缀', en: 'Token prefix' },
  'token.desc': {
    zh: '组件样式变量，可通过 CSS 自定义属性覆盖',
    en: 'Component style variable, overridable via CSS custom properties',
  },

  // 首页
  'home.tagline': {
    zh: '基于 Svelte 5 的企业级组件库，对标 Semi Design。',
    en: 'Enterprise-grade Svelte 5 component library, on par with Semi Design.',
  },
  'home.browseAll': { zh: '浏览所有组件 →', en: 'Browse all components →' },
  'home.componentsCount': { zh: '共 {n} 个组件', en: '{n} components' },
  // 组件总览 Overview
  'overview.headTitle': { zh: '组件总览', en: 'Overview' },
  'overview.title': { zh: 'Overview 组件总览', en: 'Components Overview' },
  'overview.intro': {
    zh: 'chenzy-design 当前共实现 {n} 个组件，按 6 大分类组织。点击任意组件进入详情。',
    en: 'chenzy-design currently ships {n} components organized into 6 categories. Click any component for details.',
  },
  // 首页 hero + 特性区（对齐 Semi 落地页）
  'home.heroTitle': {
    zh: '让企业级应用界面\n更一致、更优雅',
    en: 'Build consistent, elegant\nenterprise UI',
  },
  'home.heroSubtitle': {
    zh: '基于 Svelte 5 runes 的现代组件库，从复杂中后台场景提炼而来 —— 开箱即用的优质默认基础，需要时充分开放定制。',
    en: 'A modern Svelte 5 (runes) component library distilled from complex enterprise scenarios — high-quality defaults out of the box, fully customizable when you need it.',
  },
  'home.getStarted': { zh: '快速开始', en: 'Get Started' },
  'home.viewComponents': { zh: '浏览组件', en: 'Browse Components' },
  'home.featuresTitle': { zh: '核心特性', en: 'Core Features' },
  'home.feat.ready.t': { zh: '开箱即用', en: 'Ready to Use' },
  'home.feat.ready.d': {
    zh: '{n}+ 高质量组件，覆盖中后台全场景，优质默认基础保证天生一致的体验。',
    en: '{n}+ quality components covering all enterprise scenarios, with consistent defaults built in.',
  },
  'home.feat.theme.t': { zh: '主题化定制', en: 'Themeable' },
  'home.feat.theme.d': {
    zh: '数百个分层 Design Token，全局到组件级深度定制，不懂 CSS 也能换肤。',
    en: 'Hundreds of layered design tokens for deep customization from global to component level — no CSS required.',
  },
  'home.feat.dark.t': { zh: '深色模式', en: 'Dark Mode' },
  'home.feat.dark.d': {
    zh: '任意主题自动支持暗色，运行时动态切换，亦可局部区域开启。',
    en: 'Every theme supports dark mode automatically, switchable at runtime, even for local regions.',
  },
  'home.feat.i18n.t': { zh: '国际化', en: 'Internationalization' },
  'home.feat.i18n.d': {
    zh: '多语言文案、日期时区与 RTL 布局开箱支持，站点与文档双语适配。',
    en: 'Built-in multi-language, date/timezone, and RTL layout support, with bilingual site and docs.',
  },
  'home.feat.a11y.t': { zh: '无障碍', en: 'Accessibility' },
  'home.feat.a11y.d': {
    zh: '语义化标签、WAI-ARIA、键盘交互与焦点管理，每个组件附 a11y 说明与测试。',
    en: 'Semantic markup, WAI-ARIA, keyboard interaction and focus management, with a11y notes and tests per component.',
  },
  'home.feat.svelte.t': { zh: 'Svelte 5 原生', en: 'Native Svelte 5' },
  'home.feat.svelte.d': {
    zh: '基于 runes 构建，headless 与渲染分层，体积小、类型完备、性能有基准门禁。',
    en: 'Built on runes with headless/render layering — small bundle, full types, perf budgets gated in CI.',
  },
  'home.headTitle': {
    zh: 'chenzy-design — 基于 Svelte 5 的企业级组件库',
    en: 'chenzy-design — Enterprise-grade Svelte 5 component library',
  },
  'home.metaTags': {
    zh: '共 {n} 个组件 · 无障碍 · 主题化 · i18n · 性能基准',
    en: '{n} components · Accessible · Themeable · i18n · Performance benchmarks',
  },
  'home.quickstart': { zh: '快速开始', en: 'Quick Start' },
  'home.step1': { zh: '安装', en: 'Install' },
  'home.step2': { zh: '引入设计令牌 CSS（必须）', en: 'Import the design tokens CSS (required)' },
  'home.step2Hint': {
    zh: '在应用入口（如 SvelteKit 的 <code>+layout.svelte</code>）引入一次。不引入组件将没有样式。',
    en: 'Import once at the app entry (e.g. SvelteKit\'s <code>+layout.svelte</code>). Without it, components have no styles.',
  },
  'home.step3': { zh: '使用组件', en: 'Use components' },
  'home.copy': { zh: '复制', en: 'Copy' },
  'home.copied': { zh: '已复制', en: 'Copied' },
  'home.note': {
    zh: '要求 <strong>Svelte 5</strong>（runes）。暗色模式：给 <code>&lt;html&gt;</code> 设置 <code>data-theme="dark"</code>。',
    en: 'Requires <strong>Svelte 5</strong> (runes). Dark mode: set <code>data-theme="dark"</code> on <code>&lt;html&gt;</code>.',
  },
  'components.title': { zh: '组件总览', en: 'All Components' },
  'components.headTitle': { zh: '组件总览 — chenzy-design', en: 'All Components — chenzy-design' },
};

export function t(key: string, lang: Lang, params?: Record<string, string | number>): string {
  const entry = dict[key];
  if (!entry) return key;
  let s = entry[lang];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, String(v));
    }
  }
  return s;
}

/** 可本地化文本：纯字符串（仅中文）或 { zh, en } 双语对象。用于 demo 标题/描述等内容文案。 */
export type LocalizedText = string | { zh: string; en: string };

/** 取本地化文本：字符串原样返回；双语对象按 lang 取值，缺失回退 zh。 */
export function localize(text: LocalizedText | undefined, lang: Lang): string {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return text[lang] ?? text.zh;
}
