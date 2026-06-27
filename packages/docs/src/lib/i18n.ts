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
  'tab.usage': { zh: '使用场景', en: 'Usage' },
  'section.demo': { zh: '代码演示', en: 'Demos' },
  'section.api': { zh: 'API 参考', en: 'API Reference' },
  'section.tokens': { zh: '设计变量', en: 'Design Tokens' },
  'toc.title': { zh: '本页目录', en: 'On this page' },
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
