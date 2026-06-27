<script lang="ts">
  import type { Component } from 'svelte';
  import type { PageData } from './$types';
  import ApiTable from '$lib/components/ApiTable.svelte';
  import TokenTable from '$lib/components/TokenTable.svelte';
  import DemoBox from '$lib/components/DemoBox.svelte';
  import PropPlayground from '$lib/components/PropPlayground.svelte';

  const { data }: { data: PageData } = $props();
  const meta = $derived(data.meta);

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
  const demoModules = import.meta.glob('../../../demos/*/BasicDemo.svelte');
  const contentModules = import.meta.glob('../../../content/components/*.md');

  let DemoComponent = $state<Component | null>(null);
  let ContentComponent = $state<Component | null>(null);
  let playgroundValues = $state<Record<string, unknown>>({});

  $effect(() => {
    const name = meta.name.toLowerCase();
    const dir = nameToDir[name] ?? name;
    const key = `../../../demos/${dir}/BasicDemo.svelte`;
    DemoComponent = null;
    if (demoModules[key]) {
      (demoModules[key]() as Promise<{ default: Component }>).then((mod) => {
        DemoComponent = mod.default;
      }).catch(() => {
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
</script>

<svelte:head>
  <title>{meta.name} — chenzy-design</title>
</svelte:head>

<div class="component-header" data-pagefind-meta="title:{meta.name}">
  <div class="breadcrumb">
    <a href="/components">组件</a>
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

{#if activeTab === 'api'}
  {#if DemoComponent}
  <section class="section">
    <h2>代码演示</h2>
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

  <section class="section">
    <h2>API 参考</h2>
    <ApiTable props={meta.props ?? []} events={meta.events ?? []} slots={meta.slots ?? []} />
  </section>

  {#if meta.tokens?.length}
  <section class="section">
    <h2>Design Tokens</h2>
    <TokenTable tokens={meta.tokens} />
  </section>
  {/if}
{:else}
  {#if ContentComponent}
    <div class="content-body">
      <ContentComponent />
    </div>
  {:else}
    <p class="no-content">暂无使用场景文档。</p>
  {/if}
{/if}

<style>
  .component-header { margin-bottom: 32px; }
  .breadcrumb { font-size: 12px; color: var(--cd-color-text-2, #86909c); margin-bottom: 8px; }
  .breadcrumb a { color: inherit; text-decoration: none; }
  .breadcrumb a:hover { color: var(--cd-color-primary, #165dff); }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .description { color: var(--cd-color-text-1, #4e5969); margin: 0 0 24px; }
  .section { margin-bottom: 40px; }
  h2 { font-size: 18px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--cd-color-border, #e5e7eb); }
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
