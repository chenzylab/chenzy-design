<script lang="ts">
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { IconButton, Modal, HotKeys } from '@chenzy-design/svelte';
  import { IconSearch, IconClear } from '@chenzy-design/icons';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { searchSite, searchDocs, type SearchResult } from '$lib/search-index';
  import {
    searchHistory,
    clearSearchHistory,
    pushSearchHistory,
    recentComponents,
  } from '$lib/search-prefs.svelte';
  import SidebarIcon from './SidebarIcon.svelte';

  const lang = $derived(locale.value);

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let bodyEl = $state<HTMLElement | null>(null);

  // 快捷键修饰键：Mac 用 Meta(⌘)，其余平台用 Control。HotKeys 严格区分 Meta/Ctrl（对齐 Semi），
  // 故按平台选一个渲染；HotKeys 自动把 Meta→⌘、Control→Ctrl 按平台显示。
  const modifierKey = $derived<'Meta' | 'Control'>(
    browser && /Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control',
  );

  // 组件元信息查表（lowercase name → 驼峰 displayName / 分类 / 标题）：
  // 最近浏览用它渲染彩色图标与本地化名称。
  const compMeta = new Map<string, { displayName: string; category: string }>(
    Object.values(componentsJson.components as Record<string, { name: string; category?: string }>).map(
      (m) => [m.name.toLowerCase(), { displayName: m.name, category: m.category ?? '' }],
    ),
  );
  const docByName = new Map(searchDocs.map((d) => [d.name, d]));

  // 最近浏览：从存的 lowercase name 还原成 { name, displayName, category, title }。
  const recentList = $derived(
    recentComponents.items
      .map((name) => {
        const cm = compMeta.get(name);
        const doc = docByName.get(name);
        if (!cm) return null;
        return { name, displayName: cm.displayName, category: cm.category, title: doc?.title ?? cm.displayName };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  );

  // 快速访问：固定引导入口（真实存在的路由）。icon 用 emoji，简洁对齐 Semi 快速访问区。
  const quickAccess = [
    { icon: '🚀', href: `${base}/guide/getting-started`, label: { zh: 'Getting Started 快速开始', en: 'Getting Started' } },
    { icon: '🧩', href: `${base}/guide/overview`, label: { zh: 'Overview 组件总览', en: 'Overview' } },
    { icon: '🎨', href: `${base}/guide/theming`, label: { zh: 'Theming 主题定制', en: 'Theming' } },
    { icon: '📐', href: `${base}/dsm`, label: { zh: '设计系统管理 DSM', en: 'Design System Manager' } },
  ];

  // ⌘K / Ctrl+K 唤起搜索由 <HotKeys> 组件承载（见触发器）；Esc 关闭由 Modal 的 closeOnEsc 处理。

  // 打开面板时自动聚焦输入框。
  // 刻意保留 query/results：重新打开时沿用上次的搜索词与结果（用户可继续上次的查找），
  // 而非清空回到空态引导。清空由用户手动删除输入触发。
  $effect(() => {
    if (open) inputEl?.focus();
  });

  // 客户端搜索：索引在构建期由 import.meta.glob 扫组件文档生成（见 search-index.ts），
  // dev 与 prod 均可用，纯客户端匹配、无需后端与构建后索引产物。
  function search() {
    results = searchSite(query, 60);
  }

  // 结果按组件分组（对齐 Semi 搜索结果：组件名为组头 + 图标，命中项列其下带「in 章节」归属）。
  interface ResultHit {
    href: string;
    text: string;          // 命中文本（标题级=标题文本；页级=简介或组件名）
    where: string;         // 归属章节（标题级=该标题；页级=「概述」）
    navIndex: number;      // 全局可导航序号
  }
  interface ResultGroup {
    name: string;
    displayName: string;
    category: string;
    title: string;
    href: string;
    navIndex: number;      // 组头的全局可导航序号
    hits: ResultHit[];
  }
  const groupedResults = $derived.by<ResultGroup[]>(() => {
    const map = new Map<string, ResultGroup>();
    const order: ResultGroup[] = [];
    for (const r of results) {
      let g = map.get(r.name);
      if (!g) {
        const cm = compMeta.get(r.name);
        g = {
          name: r.name,
          displayName: cm?.displayName ?? r.name,
          category: cm?.category ?? '',
          title: r.title,
          href: `${base}/components/${r.name}`,
          navIndex: -1,
          hits: [],
        };
        map.set(r.name, g);
        order.push(g);
      }
      if (r.heading) {
        g.hits.push({ href: resultHref(r), text: r.heading.text, where: r.heading.text, navIndex: -1 });
      } else {
        // 页级命中：展示简介，归属「概述」
        g.hits.push({ href: resultHref(r), text: r.brief || r.title, where: t('search.overview', lang), navIndex: -1 });
      }
    }
    // 按渲染顺序（组头 + 命中项）分配全局导航序号
    let idx = 0;
    for (const g of order) {
      g.navIndex = idx++;
      for (const h of g.hits) h.navIndex = idx++;
    }
    return order;
  });

  // 扁平可导航条目（组头 + 命中项），供键盘 ↑↓ 导航与默认选中第一条。
  const flatItems = $derived.by<{ href: string }[]>(() => {
    const items: { href: string }[] = [];
    for (const g of groupedResults) {
      items.push({ href: g.href });
      for (const h of g.hits) items.push({ href: h.href });
    }
    return items;
  });

  // 当前选中项序号。默认 0（选中第一条，对齐 cmd-k 惯例）；每次结果变化重置为 0。
  let activeIndex = $state(0);
  $effect(() => {
    flatItems.length; // 依赖：结果变化时
    activeIndex = 0;
  });

  // 键盘导航与鼠标 hover 会争抢选中：键盘移动后，光标虽未动但列表滚动会让 item 滑到光标下，
  // 触发 mousemove 把选中抢回去。解法：键盘导航时置 suppressHover，直到用户真正移动鼠标才恢复。
  let suppressHover = $state(false);

  // 键盘导航：↑↓ 移动选中（循环），Enter 跳转选中项，其余交给输入框。
  function onInputKeydown(e: KeyboardEvent) {
    const n = flatItems.length;
    if (e.key === 'ArrowDown' && n > 0) {
      e.preventDefault();
      suppressHover = true;
      activeIndex = (activeIndex + 1) % n;
    } else if (e.key === 'ArrowUp' && n > 0) {
      e.preventDefault();
      suppressHover = true;
      activeIndex = (activeIndex - 1 + n) % n;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) {
        closeAndRecord();
        goto(item.href);
      } else if (query.trim()) {
        commitSearch(query);
      }
    }
  }

  // 选中项滚入可视区（键盘移动时）。
  $effect(() => {
    activeIndex; // 依赖
    if (!open) return;
    const el = bodyEl?.querySelector<HTMLElement>('[data-nav-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  });

  // 关键词高亮：按多个查询词（空格分隔）切分原文，逐段 HTML 转义后把命中段包 <mark>
  //（避免 XSS 与正则语法错，对齐多词搜索）。
  function highlight(text: string): string {
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return esc(text);
    const pat = terms.map((tm) => tm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return text
      .split(new RegExp(`(${pat})`, 'gi'))
      .map((part, i) => (i % 2 === 1 ? `<mark>${esc(part)}</mark>` : esc(part)))
      .join('');
  }

  // 提交一次搜索（回车 / 点历史标签）：记录关键词到搜索历史。
  function commitSearch(term: string) {
    query = term;
    search();
    pushSearchHistory(term);
  }

  // 命中项链接：页级 -> /components/{name}；标题级 -> 追加 #锚点（与 TOC 一致）。
  function resultHref(r: SearchResult): string {
    const hash = r.heading ? `#${r.heading.anchor}` : '';
    return `${base}/components/${r.name}${hash}`;
  }

  // 鼠标 hover 更新选中（仅在未被键盘导航抑制时）。
  function hoverActivate(idx: number) {
    if (!suppressHover) activeIndex = idx;
  }

  // 用户真正移动鼠标 → 解除 hover 抑制（body 级 mousemove）。
  function onBodyMouseMove() {
    if (suppressHover) suppressHover = false;
  }

  // 点击结果 / 条目后关闭面板，并把当前词记入历史（有输入时）。
  function closeAndRecord() {
    if (query.trim()) pushSearchHistory(query);
    open = false;
  }
</script>

<!-- IconButton 的图标以 snippet 传入（对齐库内 IconButton 用法）。 -->
{#snippet clearIcon()}<IconClear />{/snippet}

<div class="search-wrap">
  <button class="search-trigger" onclick={() => open = !open} aria-label={t('nav.search', lang)}>
    <svg class="search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
    </svg>
    <span class="search-label">{t('nav.search', lang)}</span>
  </button>
  <!-- 快捷键提示 + 监听合一：HotKeys 渲染键位提示（Meta→⌘ / Control→Ctrl 按平台）并全局监听，
       命中即打开弹窗。preventDefault 拦截浏览器默认；用组件自带 style prop 绝对定位到触发器右侧
       （HotKeys 与触发器同处 position:relative 的 .search-wrap），pointer-events:none 让点击穿透到触发器。 -->
  <HotKeys
    hotKeys={[modifierKey, 'K']}
    preventDefault
    onHotKey={() => (open = true)}
    style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); pointer-events: none;"
  />
  <!-- 弹窗外壳复用库内 Modal（自带遮罩/点遮罩关闭/Esc 关闭/portal/焦点管理）。
       header/footer 置 null、closable=false：无标题栏、无底部按钮、无右上角关闭按钮（对齐搜索面板）。 -->
  <Modal
    visible={open}
    header={null}
    footer={null}
    closable={false}
    maskClosable
    closeOnEsc
    width={720}
    class="search-modal"
    bodyStyle="padding: 0; max-height: 70vh; overflow: hidden; display: flex; flex-direction: column;"
    onCancel={() => (open = false)}
  >
    <div class="search-modal-input">
      <span class="search-modal-icon" aria-hidden="true"><IconSearch size="large" /></span>
      <input
        type="text"
        placeholder={t('search.placeholder', lang)}
        bind:this={inputEl}
        bind:value={query}
        oninput={search}
        onkeydown={onInputKeydown}
        class="search-input"
      />
      {#if query}
        <IconButton
          type="tertiary"
          theme="borderless"
          size="small"
          icon={clearIcon}
          ariaLabel={t('search.clear', lang)}
          onclick={() => { query = ''; results = []; inputEl?.focus(); }}
        />
      {/if}
    </div>

    <!-- body 级 mousemove 仅用于解除键盘导航时的 hover 抑制（非交互动作） -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="search-modal-body" bind:this={bodyEl} onmousemove={onBodyMouseMove}>
      {#if query}
          {#if groupedResults.length > 0}
          <div class="result-groups">
            <div class="group-label">{t('search.components', lang)}</div>
            {#each groupedResults as g}
              <div class="result-group">
                <a
                  class="group-head"
                  class:nav-active={g.navIndex === activeIndex}
                  data-nav-active={g.navIndex === activeIndex}
                  href={g.href}
                  onclick={closeAndRecord}
                  onmousemove={() => hoverActivate(g.navIndex)}
                >
                  <SidebarIcon name={g.name} displayName={g.displayName} category={g.category} size={24} />
                  <span class="group-title">{g.title}</span>
                </a>
                <ul class="group-hits">
                  {#each g.hits as hit}
                    <li>
                      <a
                        class:nav-active={hit.navIndex === activeIndex}
                        data-nav-active={hit.navIndex === activeIndex}
                        href={hit.href}
                        onclick={closeAndRecord}
                        onmousemove={() => hoverActivate(hit.navIndex)}
                      >
                        <span class="hit-text">{@html highlight(hit.text)}</span>
                        <span class="hit-where">{t('search.in', lang)} {hit.where}</span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
          {:else}
          <p class="search-empty">{t('search.empty', lang)}</p>
          {/if}
        {:else}
        <!-- 空态引导：搜索历史 / 最近浏览 / 快速访问（对齐 Semi 搜索面板） -->
        <div class="search-idle">
          {#if searchHistory.items.length > 0}
          <div class="idle-section">
            <div class="idle-head">
              <span class="idle-title">{t('search.history', lang)}</span>
              <button class="idle-clear" type="button" onclick={clearSearchHistory}>{t('search.clear', lang)}</button>
            </div>
            <div class="history-tags">
              {#each searchHistory.items as term}
                <button class="history-tag" type="button" onclick={() => commitSearch(term)}>{term}</button>
              {/each}
            </div>
          </div>
          {/if}

          {#if recentList.length > 0}
          <div class="idle-section">
            <div class="idle-head"><span class="idle-title">{t('search.recent', lang)}</span></div>
            <ul class="idle-list">
              {#each recentList as item}
                <li>
                  <a href="{base}/components/{item.name}" onclick={() => (open = false)}>
                    <SidebarIcon name={item.name} displayName={item.displayName} category={item.category} size={24} />
                    <span class="idle-item-label">{item.title}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          {/if}

          <div class="idle-section">
            <div class="idle-head"><span class="idle-title">{t('search.quick', lang)}</span></div>
            <ul class="idle-list">
              {#each quickAccess as q}
                <li>
                  <a href={q.href} onclick={() => (open = false)}>
                    <span class="quick-icon" aria-hidden="true">{q.icon}</span>
                    <span class="idle-item-label">{lang === 'en' ? q.label.en : q.label.zh}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        {/if}
      </div>
  </Modal>
</div>

<style>
  .search-wrap { position: relative; }
  .search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--cd-color-fill-1, #f2f3f5);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 7px 10px 7px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    min-width: 180px;
    transition: border-color 0.15s, background 0.15s;
  }
  .search-trigger:hover {
    border-color: var(--cd-color-border, #e5e7eb);
    background: var(--cd-color-bg-0, #fff);
  }
  .search-icon { flex-shrink: 0; }
  .search-label { margin-right: auto; }
  .search-trigger { padding-right: 56px; }
  .search-modal-input {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    flex-shrink: 0;
  }
  .search-modal-icon { flex-shrink: 0; color: var(--cd-color-text-2, #86909c); }
  .search-input {
    flex: 1; min-width: 0;
    border: none; outline: none; background: none;
    font-size: 16px; color: var(--cd-color-text-0, #1f2329);
  }
  .search-modal-body {
    overflow-y: auto;
    padding: 8px 12px 12px;
  }
  .search-empty { padding: 24px 8px; text-align: center; font-size: 14px; color: var(--cd-color-text-2, #86909c); }

  /* —— 分组结果（组件名为组头 + 图标，命中项列其下带「in 章节」） —— */
  .group-label { font-size: 12px; color: var(--cd-color-text-2, #86909c); padding: 8px 8px 4px; }
  .result-group { margin-bottom: 6px; }
  .group-head {
    display: flex; align-items: center; gap: 12px;
    padding: 8px; border-radius: 8px; text-decoration: none;
    background: none;
    color: var(--cd-color-text-0, #1f2329);
  }
  /* 选中态（键盘 ↑↓ 或鼠标 hover 都通过 activeIndex → .nav-active 驱动，视觉统一） */
  .group-head.nav-active { background: var(--cd-color-fill-1, #f2f3f5); }
  .group-title { font-size: 15px; font-weight: 600; }
  .group-hits { list-style: none; margin: 2px 0 0; padding: 0; }
  .group-hits li a {
    display: block; padding: 7px 8px 7px 48px; border-radius: 6px; text-decoration: none;
  }
  .group-hits li a.nav-active { background: var(--cd-color-fill-1, #f2f3f5); }
  .hit-text { display: block; font-size: 14px; color: var(--cd-color-text-0, #1f2329); }
  .hit-text :global(mark) { background: transparent; color: var(--cd-color-primary, #2f6bff); padding: 0; }
  .hit-where { display: block; font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-top: 1px; }

  /* —— 空态引导：搜索历史 / 最近浏览 / 快速访问 —— */
  .search-idle { padding: 4px 0; }
  .idle-section { padding: 4px 0; }
  .idle-section + .idle-section { margin-top: 8px; }
  .idle-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 8px;
  }
  .idle-title { font-size: 12px; color: var(--cd-color-text-2, #86909c); }
  .idle-clear {
    border: none; background: none; cursor: pointer; padding: 0;
    font-size: 12px; color: var(--cd-color-primary, #2f6bff);
  }
  .idle-clear:hover { text-decoration: underline; }
  .history-tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 8px 2px; }
  .history-tag {
    border: none; cursor: pointer;
    padding: 4px 12px; border-radius: 999px;
    background: var(--cd-color-fill-1, #f2f3f5);
    color: var(--cd-color-text-1, #4e5969);
    font-size: 13px; line-height: 1.4;
    transition: background 0.15s;
  }
  .history-tag:hover { background: var(--cd-color-fill-2, #e5e6eb); }
  .idle-list { list-style: none; margin: 0; padding: 0; }
  .idle-list li a {
    display: flex; align-items: center; gap: 12px;
    padding: 7px 8px; border-radius: 6px; text-decoration: none;
    color: var(--cd-color-text-0, #1f2329); font-size: 14px;
  }
  .idle-list li a:hover { background: var(--cd-color-fill-1, #f2f3f5); }
  .idle-item-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .quick-icon {
    width: 22px; height: 22px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
</style>
