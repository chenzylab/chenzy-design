<script lang="ts">
  import type { Component } from 'svelte';
  import type { PageData } from './$types';
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import ApiTable from '$lib/components/ApiTable.svelte';
  import DesignTokenTable from '$lib/components/DesignTokenTable.svelte';
  import DemoBox from '$lib/components/DemoBox.svelte';
  import PropPlayground from '$lib/components/PropPlayground.svelte';
  import Toc from '$lib/components/Toc.svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { resolveTokenPrefix } from '$lib/token-prefix';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);
  const lang = $derived(locale.value);

  let activeTab = $state<'api' | 'usage'>('api');

  // 组件名小写 → demo 目录名
  const nameToDir: Record<string, string> = {
    aichatdialogue: 'ai-chat-dialogue',
    aichatinput: 'ai-chat-input',
    audioplayer: 'audio-player',
    autocomplete: 'autocomplete',
    avatar: 'avatar',
    avatargroup: 'avatar',
    backtop: 'back-top',
    badge: 'badge',
    banner: 'banner',
    breadcrumb: 'breadcrumb',
    button: 'button',
    calendar: 'calendar',
    card: 'card',
    carousel: 'carousel',
    cascader: 'cascader',
    chat: 'chat',
    checkbox: 'checkbox',
    codehighlight: 'code-highlight',
    collapse: 'collapse',
    collapsible: 'collapsible',
    colorpicker: 'color-picker',
    configprovider: 'config-provider',
    cropper: 'cropper',
    datepicker: 'date-picker',
    descriptions: 'descriptions',
    divider: 'divider',
    dragmove: 'drag-move',
    drawer: 'drawer',
    dropdown: 'dropdown',
    empty: 'empty',
    floatbutton: 'float-button',
    form: 'form',
    grid: 'grid',
    highlight: 'highlight',
    hotkeys: 'hot-keys',
    icon: 'icon',
    iconbutton: 'icon-button',
    image: 'image',
    input: 'input',
    inputnumber: 'input-number',
    jsonviewer: 'json-viewer',
    layout: 'layout',
    list: 'list',
    localeprovider: 'locale-provider',
    lottieicon: 'lottie-icon',
    markdownrender: 'markdown-render',
    menu: 'menu',
    modal: 'modal',
    notification: 'notification',
    overflowlist: 'overflow-list',
    pagination: 'pagination',
    pincode: 'pin-code',
    popconfirm: 'popconfirm',
    popover: 'popover',
    progress: 'progress',
    radio: 'radio',
    rangepicker: 'date-picker',
    rating: 'rating',
    resizable: 'resizable',
    resizeobserver: 'resize-observer',
    scrolllist: 'scroll-list',
    select: 'select',
    sidesheet: 'side-sheet',
    skeleton: 'skeleton',
    slider: 'slider',
    space: 'space',
    spin: 'spin',
    steps: 'steps',
    switch: 'switch',
    table: 'table',
    tabs: 'tabs',
    tag: 'tag',
    taginput: 'tag-input',
    textarea: 'input',
    timepicker: 'time-picker',
    timeline: 'timeline',
    toast: 'toast',
    tooltip: 'tooltip',
    transfer: 'transfer',
    tree: 'tree',
    treeselect: 'tree-select',
    typography: 'typography',
    upload: 'upload',
    userguide: 'user-guide',
    videoplayer: 'video-player',
    virtuallist: 'virtual-list',
  };

  // Vite glob — 静态路径，编译时分析
  const demoModules = import.meta.glob('../../../../demos/*/BasicDemo.svelte');
  // 每个组件 demos 目录的 demos.ts（导出 demos: DemoEntry[]），用于「代码演示」区铺开全部场景
  const demoListModules = import.meta.glob('../../../../demos/*/demos.ts');
  const contentModules = import.meta.glob('../../../../content/components/*.md');

  interface DemoEntry {
    title: string;
    description?: string;
    component: Component;
    code: string;
  }

  let DemoComponent = $state<Component | null>(null);
  let demoList = $state<DemoEntry[]>([]);
  let ContentComponent = $state<Component | null>(null);
  let playgroundValues = $state<Record<string, unknown>>({});

  const lowerName = $derived(meta.name.toLowerCase());
  // token 归属前缀：用数据集真实存在的前缀匹配，避免命名漂移（见 token-prefix.ts）
  const tokenComponent = $derived(resolveTokenPrefix(lowerName, nameToDir[lowerName]));

  // 「设计文档」外链：对齐 Semi 的 /design 子站习惯，新窗口打开
  const designUrl = $derived(`${base}/design/components/${lowerName}`);

  // —— meta 字段归一化（命名不统一：subComponents/subcomponents、configObjects/config）——
  interface SubComp {
    name: string;
    element?: string;
    desc?: string;
    props?: any[];
  }
  const subComponents = $derived<SubComp[]>(meta.subComponents ?? meta.subcomponents ?? []);

  interface ConfigObj {
    name: string;
    fields: { name: string; type: string; default?: string; desc?: string }[];
  }
  const configObjects = $derived.by<ConfigObj[]>(() => {
    if (Array.isArray(meta.configObjects)) return meta.configObjects;
    // Notification.config 是 { key: 说明 } 形态 → 归一为单个配置对象
    if (meta.config && typeof meta.config === 'object') {
      return [
        {
          name: 'Config',
          fields: Object.entries(meta.config as Record<string, string>).map(([k, v]) => ({
            name: k,
            type: '—',
            desc: v,
          })),
        },
      ];
    }
    return [];
  });

  const methods = $derived<any[]>(meta.methods ?? meta.imperative ?? []);

  // a11y 归一：兼容 role/hasRole、note/notes 等。
  // 注意 hasRole 是布尔标记（「是否有 role」），不是 role 值本身，故只取字符串 role。
  const a11y = $derived(meta.a11y ?? null);
  const a11yRole = $derived(typeof a11y?.role === 'string' ? a11y.role : null);
  // keyboard 形态不统一：多数组件是 string[]（按键芯片），少数是单条 string（用 / 分隔的说明）。
  // 归一为数组：string 按 / 切分为多段，避免 {#each} 误把字符串按字符迭代（重复空格 key 崩溃）。
  const a11yKeyboard = $derived<string[]>(
    Array.isArray(a11y?.keyboard)
      ? a11y.keyboard
      : typeof a11y?.keyboard === 'string'
        ? a11y.keyboard.split('/').map((s: string) => s.trim()).filter(Boolean)
        : [],
  );
  const a11yNotes = $derived<string[]>(
    a11y?.notes ?? (a11y?.note ? [a11y.note] : []),
  );
  const a11yPattern = $derived(meta.a11yPattern ?? a11y?.pattern ?? null);
  const apgRef = $derived(meta.apgRef ?? null);

  // 文案规范来源
  const usageHints = $derived(meta.usageHints ?? null);
  const dangerousActions = $derived(meta.dangerousActions ?? null);
  // 仅保留实际存在文档页的相关组件，避免预渲染爬到不存在的页面（如 Numeral）报 404
  const validNames = new Set(
    Object.values(componentsJson.components).map((m: any) => m.name.toLowerCase()),
  );
  const relatedComponents = $derived<string[]>(
    (meta.relatedComponents ?? []).filter((rc: string) => validNames.has(rc.toLowerCase())),
  );

  // 场景 demo：demos.ts 全部条目，但剔除与交互式 BasicDemo 同源的那项（避免重复展示）
  // 每个场景 demo 生成稳定锚点 id（按序号 + title slug），供 TOC 跳转
  const sceneDemos = $derived(
    demoList
      .filter((d) => d.component !== DemoComponent)
      .map((d, i) => ({ ...d, anchorId: `demo-${i}` })),
  );

  const hasA11y = $derived(!!(a11yRole || a11yKeyboard.length || a11yNotes.length || a11yPattern));
  const hasContent = $derived(!!(usageHints || dangerousActions || relatedComponents.length));
  const hasTokens = $derived(tokenComponent.length > 0);

  interface TocItem {
    id: string;
    title: string;
    level?: number;
  }

  // TOC 章节：仅列出实际渲染的区块；代码演示下逐个场景作为子项（对齐 Semi 章节目录）
  const tocSections = $derived(
    [
      DemoComponent || sceneDemos.length
        ? { id: 'demo', title: t('section.demo', lang) }
        : null,
      ...sceneDemos.map((d) => ({ id: d.anchorId, title: d.title, level: 2 })),
      { id: 'api', title: t('section.api', lang) },
      hasA11y ? { id: 'a11y', title: t('section.a11y', lang) } : null,
      hasContent ? { id: 'content', title: t('section.content', lang) } : null,
      hasTokens ? { id: 'tokens', title: t('section.tokens', lang) } : null,
    ].filter((s): s is TocItem => s !== null),
  );

  function hasPlayground(props: any[]): boolean {
    return props.some((p) => {
      const ty = p.type ?? '';
      return ty === 'boolean' || ty === 'number' || ty === 'string' || (ty.includes("'") && ty.includes('|'));
    });
  }

  $effect(() => {
    const dir = nameToDir[lowerName] ?? lowerName;
    const key = `../../../../demos/${dir}/BasicDemo.svelte`;
    DemoComponent = null;
    if (demoModules[key]) {
      (demoModules[key]() as Promise<{ default: Component }>)
        .then((mod) => {
          DemoComponent = mod.default;
        })
        .catch(() => {
          DemoComponent = null;
        });
    }
  });

  // 加载该组件的多场景 demo 列表（demos.ts）。首项默认作为可调试的 playground 演示，
  // 其余按顺序铺开为带源码的 DemoBox（对齐 Semi 的多场景代码演示）。
  $effect(() => {
    const dir = nameToDir[lowerName] ?? lowerName;
    const key = `../../../../demos/${dir}/demos.ts`;
    demoList = [];
    if (demoListModules[key]) {
      (demoListModules[key]() as Promise<{ demos: DemoEntry[] }>)
        .then((mod) => {
          demoList = mod.demos ?? [];
        })
        .catch(() => {
          demoList = [];
        });
    }
  });

  $effect(() => {
    const key = `../../../../content/components/${lowerName}.md`;
    ContentComponent = null;
    if (contentModules[key]) {
      (contentModules[key]() as Promise<{ default: Component }>)
        .then((mod) => {
          ContentComponent = mod.default;
        })
        .catch(() => {
          ContentComponent = null;
        });
    }
  });

  $effect(() => {
    const init: Record<string, unknown> = {};
    for (const p of meta.props ?? []) {
      const d = p.default ?? '';
      if (d === 'true') init[p.name] = true;
      else if (d === 'false') init[p.name] = false;
      else {
        const n = Number(d);
        init[p.name] = !isNaN(n) && d !== '' ? n : d.replace(/^['"]|['"]$/g, '');
      }
    }
    playgroundValues = init;
  });
</script>

<svelte:head>
  <title>{meta.name} — chenzy-design</title>
</svelte:head>

<div class="page">
  <div class="page-main">
    <div class="component-header" data-pagefind-meta="title:{meta.name}">
      <div class="breadcrumb">
        <a href="{base}/components">组件</a>
        <span> / </span>
        <span>{meta.category}</span>
      </div>
      <h1>{meta.name}</h1>
      <p class="description">{meta.description}</p>
    </div>

    <div class="tabs">
      <button class="tab" class:active={activeTab === 'api'} onclick={() => (activeTab = 'api')}>
        {t('tab.api', lang)}
      </button>
      <button class="tab" class:active={activeTab === 'usage'} onclick={() => (activeTab = 'usage')}>
        {t('tab.usage', lang)}
      </button>
      <a class="tab tab-link" href={designUrl} target="_blank" rel="noreferrer" title={t('design.openInNew', lang)}>
        {t('tab.design', lang)}
        <span class="ext-icon" aria-hidden="true">↗</span>
      </a>
    </div>

    {#if activeTab === 'api'}
      <!-- 代码演示 -->
      {#if DemoComponent || demoList.length}
        <section class="section" id="demo">
          <h2>{t('section.demo', lang)}</h2>

          <!-- 交互式调试：BasicDemo + PropPlayground 实时改 props -->
          {#if DemoComponent}
            <div class="demo-with-playground">
              <div class="demo-main">
                <DemoBox title={t('demo.interactive', lang)}>
                  <DemoComponent {...playgroundValues} />
                </DemoBox>
              </div>
              {#if hasPlayground(meta.props ?? [])}
                <div class="demo-sidebar">
                  <PropPlayground
                    props={meta.props ?? []}
                    values={playgroundValues}
                    onchange={(v) => (playgroundValues = v)}
                  />
                </div>
              {/if}
            </div>
          {/if}

          <!-- 多场景 demo：逐项铺开，带标题/描述/源码（对齐 Semi） -->
          {#each sceneDemos as demo (demo.title)}
            {@const SceneComp = demo.component}
            <div id={demo.anchorId} class="scene-anchor">
              <DemoBox title={demo.title} description={demo.description} code={demo.code}>
                <SceneComp />
              </DemoBox>
            </div>
          {/each}
        </section>
      {/if}

      <!-- API 参考：主组件 + 子组件 + 配置对象 + 方法 -->
      <section class="section" id="api">
        <h2>{t('section.api', lang)}</h2>

        <h3 class="api-group-title">{meta.name}</h3>
        <ApiTable props={meta.props ?? []} events={meta.events ?? []} slots={meta.slots ?? []} />

        {#each subComponents as sub (sub.name)}
          <div class="sub-api">
            <h3 class="api-group-title">
              {sub.name}
              {#if sub.element}<span class="el-tag">&lt;{sub.element}&gt;</span>{/if}
            </h3>
            {#if sub.desc}<p class="sub-desc">{sub.desc}</p>{/if}
            <ApiTable props={sub.props ?? []} events={[]} slots={[]} />
          </div>
        {/each}

        {#each configObjects as cfg (cfg.name)}
          <div class="sub-api">
            <h3 class="api-group-title">{cfg.name}</h3>
            <table class="api-table">
              <thead>
                <tr>
                  <th>{t('api.name', lang)}</th>
                  <th>{t('api.type', lang)}</th>
                  <th>{t('api.default', lang)}</th>
                  <th>{t('api.desc', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {#each cfg.fields as f (f.name)}
                  <tr>
                    <td><code>{f.name}</code></td>
                    <td><code class="type">{f.type}</code></td>
                    <td>{f.default ?? '—'}</td>
                    <td>{f.desc ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/each}

        {#if methods.length}
          <div class="sub-api">
            <h3 class="api-group-title">Methods</h3>
            <table class="api-table">
              <thead>
                <tr>
                  <th>{t('api.name', lang)}</th>
                  <th>{t('api.type', lang)}</th>
                  <th>{t('api.desc', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {#each methods as m (m.name)}
                  <tr>
                    <td><code>{m.name}</code></td>
                    <td><code class="type">{m.type ?? '—'}</code></td>
                    <td>{m.desc ?? '—'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </section>

      <!-- Accessibility -->
      {#if hasA11y}
        <section class="section" id="a11y">
          <h2>{t('section.a11y', lang)}</h2>
          {#if a11yRole || a11yPattern || a11yKeyboard.length}
            <table class="api-table a11y-table">
              <tbody>
                {#if a11yRole}
                  <tr>
                    <td class="a11y-key">{t('a11y.role', lang)}</td>
                    <td><code>{a11yRole}</code></td>
                  </tr>
                {/if}
                {#if a11yPattern}
                  <tr>
                    <td class="a11y-key">APG</td>
                    <td><code>{a11yPattern}</code></td>
                  </tr>
                {/if}
                {#if a11yKeyboard.length}
                  <tr>
                    <td class="a11y-key">{t('a11y.keyboard', lang)}</td>
                    <td>
                      {#each a11yKeyboard as k, i (i)}<kbd>{k}</kbd>{/each}
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          {/if}
          {#if a11yNotes.length}
            <ul class="a11y-notes">
              {#each a11yNotes as note (note)}<li>{note}</li>{/each}
            </ul>
          {/if}
          {#if apgRef}
            <p class="apg-ref">
              {t('a11y.apg', lang)}：<code>{apgRef}</code>
            </p>
          {/if}
        </section>
      {/if}

      <!-- 文案规范 -->
      {#if hasContent}
        <section class="section" id="content">
          <h2>{t('section.content', lang)}</h2>
          {#if usageHints}
            <h3 class="content-sub">{t('content.usage', lang)}</h3>
            <p class="content-text">{usageHints}</p>
          {/if}
          {#if dangerousActions}
            <h3 class="content-sub">{t('content.danger', lang)}</h3>
            <p class="content-text">{dangerousActions}</p>
          {/if}
          {#if relatedComponents.length}
            <h3 class="content-sub">{t('content.related', lang)}</h3>
            <div class="related">
              {#each relatedComponents as rc (rc)}
                <a class="related-chip" href="{base}/components/{rc.toLowerCase()}">{rc}</a>
              {/each}
            </div>
          {/if}
          <p class="guide-link">
            {t('content.guideLink', lang)}
            <a href="{base}/guide/content-guidelines">{t('content.guideLinkText', lang)}</a>。
          </p>
        </section>
      {/if}

      <!-- 设计变量 -->
      {#if hasTokens}
        <section class="section" id="tokens">
          <h2>{t('section.tokens', lang)}</h2>
          <DesignTokenTable component={tokenComponent} />
        </section>
      {/if}
    {:else if ContentComponent}
      <div class="content-body">
        <ContentComponent />
      </div>
    {:else}
      <p class="no-content">{t('usage.empty', lang)}</p>
    {/if}
  </div>

  {#if activeTab === 'api'}
    <Toc sections={tocSections} />
  {/if}
</div>

<style>
  .page {
    display: flex;
    gap: 48px;
    align-items: flex-start;
  }
  .page-main {
    flex: 1;
    min-width: 0;
    /* 内容保持可读宽度，TOC 由 margin-left:auto 推到主区最右侧（对齐 Semi） */
    max-width: 860px;
  }
  .page > :global(.toc) {
    margin-left: auto;
  }
  .component-header {
    margin-bottom: 32px;
  }
  .breadcrumb {
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    margin-bottom: 8px;
  }
  .breadcrumb a {
    color: inherit;
    text-decoration: none;
  }
  .breadcrumb a:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  h1 {
    font-size: 28px;
    margin: 0 0 8px;
  }
  .description {
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 24px;
  }
  .section {
    margin-bottom: 48px;
    scroll-margin-top: 80px;
  }
  /* 场景 demo 锚点：跳转时避让 sticky 顶栏 */
  .scene-anchor {
    scroll-margin-top: 80px;
  }
  h2 {
    font-size: 18px;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .api-group-title {
    font-size: 15px;
    margin: 24px 0 8px;
    color: var(--cd-color-text-0, #1f2329);
    font-weight: 600;
  }
  .api-group-title:first-of-type {
    margin-top: 0;
  }
  .el-tag {
    font-size: 12px;
    font-weight: 400;
    color: var(--cd-color-text-2, #86909c);
    font-family: 'JetBrains Mono', monospace;
    margin-left: 6px;
  }
  .sub-desc {
    font-size: 13px;
    color: var(--cd-color-text-1, #4e5969);
    margin: 0 0 8px;
    line-height: 1.6;
  }
  .sub-api {
    margin-top: 24px;
  }
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    margin-bottom: 24px;
  }
  .tab {
    padding: 8px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: -1px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .tab.active {
    color: var(--cd-color-primary, #0064fa);
    border-bottom-color: var(--cd-color-primary, #0064fa);
  }
  .tab-link {
    margin-left: auto;
    color: var(--cd-color-text-2, #86909c);
  }
  .tab-link:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  .ext-icon {
    font-size: 12px;
  }
  .content-body :global(h2) {
    font-size: 18px;
    margin: 24px 0 12px;
  }
  .content-body :global(h3) {
    font-size: 15px;
    margin: 16px 0 8px;
  }
  .content-body :global(p) {
    line-height: 1.7;
    color: var(--cd-color-text-0, #1f2329);
    margin: 0 0 12px;
  }
  .content-body :global(ul),
  .content-body :global(ol) {
    padding-left: 20px;
    margin: 0 0 12px;
  }
  .content-body :global(li) {
    line-height: 1.7;
    margin-bottom: 4px;
  }
  .content-body :global(a) {
    color: var(--cd-color-primary, #0064fa);
    text-decoration: none;
  }
  .content-body :global(a:hover) {
    text-decoration: underline;
  }
  .content-body :global(code) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }
  .content-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 0 0 16px;
  }
  .content-body :global(th) {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .content-body :global(td) {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
  }
  .content-body :global(strong) {
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .no-content {
    color: var(--cd-color-text-2, #86909c);
    font-size: 14px;
    padding: 24px 0;
  }
  .demo-with-playground {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .demo-main {
    flex: 1;
    min-width: 0;
  }
  .demo-sidebar {
    width: 260px;
    flex-shrink: 0;
    position: sticky;
    top: 16px;
  }

  /* inline api/config/method 表（与 ApiTable 视觉一致） */
  .api-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .api-table th {
    text-align: left;
    padding: 8px 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    font-weight: 600;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .api-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
    vertical-align: top;
  }
  .api-table code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .api-table code.type {
    color: var(--cd-color-primary, #0064fa);
    background: transparent;
  }

  /* Accessibility */
  .a11y-table .a11y-key {
    width: 140px;
    color: var(--cd-color-text-2, #86909c);
    font-weight: 600;
  }
  kbd {
    display: inline-block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 2px 7px;
    margin: 0 4px 4px 0;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-bottom-width: 2px;
    border-radius: 5px;
    background: var(--cd-color-bg-0, #fff);
    color: var(--cd-color-text-0, #1f2329);
  }
  .a11y-notes {
    margin: 16px 0 0;
    padding-left: 20px;
  }
  .a11y-notes li {
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    margin-bottom: 6px;
  }
  .apg-ref {
    margin-top: 12px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
  }
  .apg-ref code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* 文案规范 */
  .content-sub {
    font-size: 14px;
    margin: 20px 0 8px;
    color: var(--cd-color-text-0, #1f2329);
    font-weight: 600;
  }
  .content-sub:first-child {
    margin-top: 0;
  }
  .content-text {
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    margin: 0;
  }
  .related {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .related-chip {
    display: inline-block;
    padding: 4px 12px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 16px;
    font-size: 13px;
    text-decoration: none;
    color: var(--cd-color-text-1, #4e5969);
  }
  .related-chip:hover {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
  }
  .guide-link {
    margin-top: 20px;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
  }
  .guide-link a {
    color: var(--cd-color-primary, #0064fa);
    text-decoration: none;
  }

  @media (max-width: 960px) {
    .demo-with-playground {
      flex-direction: column;
    }
    .demo-sidebar {
      width: 100%;
      position: static;
    }
  }
</style>
