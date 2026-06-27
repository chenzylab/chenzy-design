<script lang="ts">
  import { base } from '$app/paths';
  import type { Component } from 'svelte';
  import type { PageData } from './$types';
  import ApiTable from '$lib/components/ApiTable.svelte';
  import TokenTable from '$lib/components/TokenTable.svelte';
  import DemoBox from '$lib/components/DemoBox.svelte';
  import PropPlayground from '$lib/components/PropPlayground.svelte';
  import Toc from '$lib/components/Toc.svelte';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);

  let activeTab = $state<'api' | 'usage'>('api');

  // 子组件：meta.subComponents 可能是对象数组（带 props，可渲染独立 API 表）
  // 或纯字符串数组（仅名称，无 props，跳过表格渲染）
  type SubComponentMeta = {
    name: string;
    props?: { name: string; type: string; default?: string; desc?: string }[];
    events?: { name: string; payload?: string; desc?: string }[];
    slots?: { name: string; desc?: string }[];
  };
  const subComponents = $derived<SubComponentMeta[]>(
    ((meta as { subComponents?: unknown }).subComponents ?? [])
      .filter((s: unknown): s is SubComponentMeta => typeof s === 'object' && s !== null)
      .filter((s: SubComponentMeta) => (s.props?.length ?? 0) > 0 || (s.events?.length ?? 0) > 0 || (s.slots?.length ?? 0) > 0),
  );

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
  const demoModules = import.meta.glob('../../../demos/*/BasicDemo.svelte');
  const contentModules = import.meta.glob('../../../content/components/*.md');

  // 多 demo 结构：试点组件目录下有 demos.ts，懒加载
  type DemoEntry = {
    title: string;
    description?: string;
    component: Component;
    code: string;
  };
  const demosModules = import.meta.glob('../../../demos/*/demos.ts');

  let DemoComponent = $state<Component | null>(null);
  let demoList = $state<DemoEntry[] | null>(null);
  let ContentComponent = $state<Component | null>(null);
  let playgroundValues = $state<Record<string, unknown>>({});

  $effect(() => {
    const name = meta.name.toLowerCase();
    const dir = nameToDir[name] ?? name;
    const demosKey = `../../../demos/${dir}/demos.ts`;
    const basicKey = `../../../demos/${dir}/BasicDemo.svelte`;
    DemoComponent = null;
    demoList = null;

    if (demosModules[demosKey]) {
      // 新结构：多 demo
      (demosModules[demosKey]() as Promise<{ demos: DemoEntry[] }>)
        .then((mod) => {
          demoList = mod.demos;
        })
        .catch(() => {
          demoList = null;
        });
    } else if (demoModules[basicKey]) {
      // 回退：单 BasicDemo
      (demoModules[basicKey]() as Promise<{ default: Component }>)
        .then((mod) => {
          DemoComponent = mod.default;
        })
        .catch(() => {
          DemoComponent = null;
        });
    }
  });

  $effect(() => {
    const name = meta.name.toLowerCase();
    const key = `../../../content/components/${name}.md`;
    ContentComponent = null;
    if (contentModules[key]) {
      (contentModules[key]() as Promise<{ default: Component }>).then((mod) => {
        ContentComponent = mod.default;
      }).catch(() => {
        ContentComponent = null;
      });
    }
  });

  $effect(() => {
    const init: Record<string, unknown> = {};
    for (const p of (meta.props ?? [])) {
      const d = p.default ?? '';
      if (d === 'true') init[p.name] = true;
      else if (d === 'false') init[p.name] = false;
      else { const n = Number(d); init[p.name] = (!isNaN(n) && d !== '') ? n : d.replace(/^['"]|['"]$/g, ''); }
    }
    playgroundValues = init;
  });

  // 是否有代码演示
  const hasDemo = $derived(!!demoList || !!DemoComponent);
  // 是否有 API 内容
  const hasApi = $derived(
    (meta.props?.length ?? 0) > 0 ||
      (meta.events?.length ?? 0) > 0 ||
      (meta.slots?.length ?? 0) > 0,
  );

  // TOC sections：随当前 tab 与实际渲染内容动态生成
  const sections = $derived.by<{ id: string; title: string }[]>(() => {
    if (activeTab === 'api') {
      const list: { id: string; title: string }[] = [];
      if (hasDemo) list.push({ id: 'demo', title: '代码演示' });
      if (hasApi) list.push({ id: 'api', title: 'API 参考' });
      for (const sub of subComponents) {
        list.push({ id: `api-${slugify(sub.name)}`, title: sub.name });
      }
      if (meta.tokens?.length) list.push({ id: 'tokens', title: '设计变量' });
      return list;
    }
    // usage tab：content md 整体渲染，无法可靠拆分，给单一锚点
    if (ContentComponent) return [{ id: 'usage', title: '使用场景' }];
    return [];
  });

  function slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
</script>

<svelte:head>
  <title>{meta.name} — chenzy-design</title>
</svelte:head>

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
  <button class="tab" class:active={activeTab === 'api'} onclick={() => activeTab = 'api'}>
    API 文档
  </button>
  <button class="tab" class:active={activeTab === 'usage'} onclick={() => activeTab = 'usage'}>
    使用场景
  </button>
</div>

<div class="page-layout">
  <div class="page-main">
    {#if activeTab === 'api'}
      {#if demoList}
      <section class="section" id="demo">
        <h2 class="section-heading">
          代码演示
          <a href="#demo" class="anchor-link" aria-label="锚点链接">🔗</a>
        </h2>
        {#each demoList as d (d.title)}
          {@const Demo = d.component}
          <DemoBox title={d.title} description={d.description} code={d.code}>
            <Demo />
          </DemoBox>
        {/each}
      </section>
      {:else if DemoComponent}
      <section class="section" id="demo">
        <h2 class="section-heading">
          代码演示
          <a href="#demo" class="anchor-link" aria-label="锚点链接">🔗</a>
        </h2>
        <div class="demo-with-playground">
          <div class="demo-main">
            <DemoBox title="基本用法">
              <DemoComponent {...playgroundValues} />
            </DemoBox>
          </div>
          {#if (meta.props ?? []).some(p => {
            const t = p.type ?? '';
            return t === 'boolean' || t === 'number' || t === 'string' || (t.includes("'") && t.includes('|'));
          })}
          <div class="demo-sidebar">
            <PropPlayground
              props={meta.props ?? []}
              values={playgroundValues}
              onchange={(v) => { playgroundValues = v; }}
            />
          </div>
          {/if}
        </div>
      </section>
      {/if}

      {#if hasApi}
      <section class="section" id="api">
        <h2 class="section-heading">
          API 参考
          <a href="#api" class="anchor-link" aria-label="锚点链接">🔗</a>
        </h2>
        <ApiTable props={meta.props ?? []} events={meta.events ?? []} slots={meta.slots ?? []} />
      </section>
      {/if}

      {#each subComponents as sub (sub.name)}
      <section class="section" id="api-{slugify(sub.name)}">
        <h2 class="section-heading">
          {sub.name}
          <a href="#api-{slugify(sub.name)}" class="anchor-link" aria-label="锚点链接">🔗</a>
        </h2>
        <ApiTable props={sub.props ?? []} events={sub.events ?? []} slots={sub.slots ?? []} />
      </section>
      {/each}

      {#if meta.tokens?.length}
      <section class="section" id="tokens">
        <h2 class="section-heading">
          设计变量
          <a href="#tokens" class="anchor-link" aria-label="锚点链接">🔗</a>
        </h2>
        <TokenTable tokens={meta.tokens} />
      </section>
      {/if}
    {:else}
      {#if ContentComponent}
        <section class="section" id="usage">
          <div class="content-body">
            <ContentComponent />
          </div>
        </section>
      {:else}
        <p class="no-content">暂无使用场景文档。</p>
      {/if}
    {/if}
  </div>

  <aside class="page-toc">
    <Toc {sections} />
  </aside>
</div>

<style>
  .component-header { margin-bottom: 32px; }
  .breadcrumb { font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-bottom: 8px; }
  .breadcrumb a { color: inherit; text-decoration: none; }
  .breadcrumb a:hover { color: var(--cd-color-primary, #165dff); }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .description { color: var(--cd-color-text-1, #4e5969); margin: 0 0 24px; }
  .section { margin-bottom: 40px; scroll-margin-top: 80px; }
  h2 { font-size: 18px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--cd-color-border, #e5e7eb); }
  .section-heading { display: flex; align-items: center; }
  .anchor-link {
    opacity: 0;
    margin-left: 8px;
    text-decoration: none;
    font-size: 14px;
    line-height: 1;
    transition: opacity 0.15s;
  }
  .section-heading:hover .anchor-link { opacity: 0.6; }
  .anchor-link:hover { opacity: 1 !important; }
  .page-layout { display: flex; gap: 40px; align-items: flex-start; }
  .page-main { flex: 1; min-width: 0; }
  .page-toc { flex-shrink: 0; }
  @media (max-width: 1100px) {
    .page-toc { display: none; }
  }
  .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--cd-color-border, #e5e7eb); margin-bottom: 24px; }
  .tab {
    padding: 8px 20px; background: none; border: none; border-bottom: 2px solid transparent;
    cursor: pointer; font-size: 14px; color: var(--cd-color-text-1, #4e5969);
    margin-bottom: -1px;
  }
  .tab.active { color: var(--cd-color-primary, #165dff); border-bottom-color: var(--cd-color-primary, #165dff); }
  .content-body :global(h2) { font-size: 18px; margin: 24px 0 12px; }
  .content-body :global(h3) { font-size: 15px; margin: 16px 0 8px; }
  .content-body :global(p) { line-height: 1.7; color: var(--cd-color-text-0, #1f2329); margin: 0 0 12px; }
  .content-body :global(ul), .content-body :global(ol) { padding-left: 20px; margin: 0 0 12px; }
  .content-body :global(li) { line-height: 1.7; margin-bottom: 4px; }
  .content-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 16px;
    font-size: 13px;
  }
  .content-body :global(th), .content-body :global(td) {
    border: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
    line-height: 1.6;
  }
  .content-body :global(th) {
    background: var(--cd-color-fill-1, #f7f8fa);
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  /* ✅/❌ 对照表：首列推荐绿底、次列不推荐红底（仅文案规范表） */
  .content-body :global(td:first-child) { background: rgba(0, 180, 42, 0.04); }
  .content-body :global(td:last-child) { background: rgba(245, 63, 63, 0.04); }
  .content-body :global(code) {
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
  }
  .no-content { color: var(--cd-color-text-2, #86909c); font-size: 14px; padding: 24px 0; }
  .demo-with-playground {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .demo-main { flex: 1; min-width: 0; }
  .demo-sidebar { width: 260px; flex-shrink: 0; position: sticky; top: 16px; }
  @media (max-width: 960px) {
    .demo-with-playground { flex-direction: column; }
    .demo-sidebar { width: 100%; position: static; }
  }
</style>
