<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import type { Snippet } from 'svelte';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { Nav, LocaleProvider } from '@chenzy-design/svelte';
  import type { NavItemDef, NavSelectData } from '@chenzy-design/svelte';
  import { goto } from '$app/navigation';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { componentNamesZh } from '$lib/component-names-zh';
  import { componentLocale } from '$lib/component-locale';
  import SidebarIcon from '$lib/components/SidebarIcon.svelte';

  const { children }: { children: Snippet } = $props();

  const lang = $derived(locale.value);
  // 全站套 LocaleProvider（对齐 Semi layout.js 顶层 LocaleProvider）：站内所有本库组件
  // 的内置文案（Table 分页 range、Pagination、空态等）跟随文档站语言，无需逐处单独套。
  // 语言映射集中在 component-locale.ts，多语言扩展只改那一处。
  const appLocale = $derived(componentLocale[lang]);

  // 按 category 分组（label key 走 i18n）
  const categoryKey: Record<string, string> = {
    ai: 'cat.ai',
    basic: 'cat.basic',
    plus: 'cat.plus',
    input: 'cat.input',
    navigation: 'cat.navigation',
    show: 'cat.show',
    feedback: 'cat.feedback',
    other: 'cat.other',
  };

  const grouped = Object.entries(componentsJson.components).reduce(
    (acc, [, meta]) => {
      const cat = (meta as { category?: string }).category ?? 'other';
      (acc[cat] ??= []).push(meta as { name: string; category?: string });
      return acc;
    },
    {} as Record<string, { name: string; category?: string }[]>,
  );

  const categoryOrder = ['ai', 'basic', 'plus', 'input', 'navigation', 'show', 'feedback', 'other'];

  // 全局文档分组（对齐 Semi 左侧「开始 / 体验增强」）。label 中英双版。
  // icon：对齐 Semi content frontmatter 的 doc-* 图标（本库 icons-lab 具名图标名）。
  const guideGroups = [
    {
      titleKey: 'group.start',
      items: [
        { zh: 'Introduction 介绍', en: 'Introduction', href: '/guide/introduction', icon: 'Introduction' },
        { zh: 'Getting Started 快速开始', en: 'Getting Started', href: '/guide/getting-started', icon: 'GettingStarted' },
        { zh: 'Overview 组件总览', en: 'Overview', href: '/guide/overview', icon: 'Overview' },
      ],
    },
    {
      titleKey: 'group.experience',
      items: [
        { zh: 'Theming 主题定制', en: 'Theming', href: '/guide/theming', icon: 'Theming' },
        { zh: 'Accessibility 无障碍', en: 'Accessibility', href: '/guide/accessibility', icon: 'Accessibility' },
        { zh: 'Internationalization 国际化', en: 'Internationalization', href: '/guide/i18n', icon: 'Internationalization' },
        { zh: 'Content Guidelines 文案规范', en: 'Content Guidelines', href: '/guide/content-guidelines', icon: 'ContentGuidelines' },
      ],
    },
  ];

  // —— 用本库 Nav 组件渲染侧边栏（对齐 Semi docs：侧边栏即 Navigation 组件）——
  // 构建 items 树：分类 = 含 items 的父项（Nav.Sub），组件 = 叶子项（link 导航 + renderIcon 图标）。
  type NavLeaf = {
    itemKey: string;
    text: string;
    link: string;
    // 携带图标匹配元数据（供 renderIcon 用），不影响 Nav 行为。
    iconName?: string;
    iconDisplayName?: string;
    iconCategory?: string;
  };
  type NavSub = { itemKey: string; text: string; items: NavLeaf[] };

  function labelOf(en: string, zhSuffix?: string): string {
    return lang === 'zh' && zhSuffix ? `${en} ${zhSuffix}` : en;
  }

  const componentItems = $derived<NavSub[]>(
    categoryOrder
      .filter((cat) => grouped[cat])
      .map((cat) => {
        const leaves: NavLeaf[] = [];
        // ai 分类首项：AIComponent 能力介绍（特殊页，非组件）。
        if (cat === 'ai') {
          leaves.push({
            itemKey: 'guide/ai-component',
            text: labelOf('AIComponent', '能力介绍'),
            link: `${base}/guide/ai-component`,
            iconName: 'aicomponent',
            iconDisplayName: 'AIComponent',
            iconCategory: 'ai',
          });
        }
        for (const comp of grouped[cat]) {
          const name = comp.name.toLowerCase();
          leaves.push({
            itemKey: `components/${name}`,
            text: labelOf(comp.name, componentNamesZh[name]),
            link: `${base}/components/${name}`,
            iconName: name,
            iconDisplayName: comp.name,
            iconCategory: comp.category ?? 'other',
          });
        }
        return { itemKey: `cat-${cat}`, text: t(categoryKey[cat] ?? cat, lang), items: leaves };
      }),
  );

  const guideItems = $derived<NavSub[]>(
    guideGroups.map((group) => ({
      itemKey: `guide-${group.titleKey}`,
      text: t(group.titleKey, lang),
      items: group.items.map((it) => ({
        itemKey: it.href,
        text: lang === 'zh' ? it.zh : it.en,
        link: `${base}${it.href}`,
        iconName: it.icon.toLowerCase(),
        iconDisplayName: it.icon,
      })),
    })),
  );

  const navItems = $derived([...guideItems, ...componentItems]);

  // 选中项 key = 当前路由对应的 itemKey；展开所有分类（对齐 Semi docs 侧栏全展开）。
  const currentKey = $derived.by(() => {
    const path = $page.url.pathname;
    for (const sub of navItems) {
      for (const leaf of sub.items as NavLeaf[]) {
        if (leaf.link === path) return leaf.itemKey;
      }
    }
    return undefined;
  });
  const openKeys = $derived(navItems.map((s) => s.itemKey));

  // 叶子项已带 link（Nav 渲染为 <a href>，原生可跳转）；onSelect 额外走 SPA 导航更顺滑。
  function handleNavSelect(data: NavSelectData): void {
    const key = String(data.itemKey);
    for (const sub of navItems) {
      const leaf = (sub.items as NavLeaf[]).find((l) => l.itemKey === key);
      if (leaf) {
        void goto(leaf.link);
        return;
      }
    }
  }
</script>

<LocaleProvider locale={appLocale}>
<div class="docs-body">
  <aside class="docs-sidebar">
    <!-- 侧边栏用本库 Nav 组件渲染（对齐 Semi docs：侧边栏即 Navigation 组件）。
         分类为 Nav.Sub（全展开），组件为 link 叶子项；renderIcon 按 item 数据驱动 icons-lab 图标。 -->
    <!-- 严格对齐 Semi docs（side-nav.js 给 Nav 传 style={{ width:'100%', minWidth:240, maxWidth:280 }}）：
         组件默认 240px 容器撑满至侧栏宽度（240–280 自适应），item 的 width:100% 随之生效、文字区够宽。 -->
    <Nav
      mode="vertical"
      items={navItems}
      selectedKeys={currentKey ? [currentKey] : []}
      defaultOpenKeys={openKeys}
      onSelect={handleNavSelect}
      style="width:100%;min-width:240px;max-width:280px"
      {renderIcon}
    />
  </aside>

{#snippet renderIcon(item: NavItemDef)}
  {@const leaf = item as unknown as { iconName?: string; iconDisplayName?: string; iconCategory?: string }}
  {#if leaf.iconName}
    <SidebarIcon
      name={leaf.iconName}
      displayName={leaf.iconDisplayName}
      category={leaf.iconCategory ?? 'other'}
    />
  {/if}
{/snippet}

  <main class="docs-main" data-pagefind-body>
    {@render children()}
  </main>
</div>
</LocaleProvider>

<style>
  .docs-body {
    display: flex;
    flex: 1;
  }
  .docs-sidebar {
    /* 侧栏宽度对齐 Semi docs（src/styles/variable.scss $nav-width: 280px）。 */
    width: 280px;
    flex-shrink: 0;
    border-right: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 16px 0;
    overflow-y: auto;
    position: sticky;
    top: 60px;
    height: calc(100vh - 60px);
  }
  /* 侧边栏基础样式由本库 Nav 组件承载（已对齐 Semi Navigation）。以下 override 严格对齐
     Semi docs 站点对 Nav 的定制（src/components/side-nav.js + src/styles/layout.scss、doc.scss、index.scss）：
       - 子导航组件项高度 40px（layout.scss `.semi-navigation-sub .semi-navigation-item { height: 40px }`）
       - item line-height 24px（doc.scss）、item 间距 margin-bottom 8px（index.scss）
     图标 extra-large(24px) 已由 SidebarIcon 对齐（side-nav.js `<Icon size="extra-large">`）。 */
  .docs-sidebar :global(.cd-nav__item-normal) {
    block-size: 40px;
    line-height: 24px;
  }
  .docs-sidebar :global(.cd-nav__item) {
    margin-block-end: 8px;
  }
  /* 文字完整显示（对齐 Semi docs index.scss `#side-nav .item-text{text-overflow:inherit}`）：
     Nav 已经 style=width:100% 撑满侧栏、item 文字区够宽，这里仅解除组件默认的 ellipsis 截断。 */
  .docs-sidebar :global(.cd-nav__item-text) {
    overflow: visible;
    text-overflow: clip;
  }
  /* 侧边栏样式由本库 Nav 组件自带（已对齐 Semi Navigation）；此处仅补 Semi docs 站点级 override。 */
  .docs-main {
    flex: 1;
    padding: 32px 56px;
    max-width: 1440px;
    min-width: 0;
  }
</style>
