<script lang="ts">
  import {
    Avatar,
    Badge,
    Button,
    Checkbox,
    Input,
    Progress,
    Radio,
    RadioGroup,
    Select,
    Slider,
    Switch,
    Tabs,
    TabPane,
    Tag,
    Tooltip,
    Modal,
  } from '@chenzy-design/svelte';
  import {
    aliasTokens,
    componentList,
    componentTokens,
    expandOverridesForPreview,
    groupAlias,
    type ManifestToken,
  } from './tokens';

  // ── 覆写状态 ──────────────────────────────────────────────────
  // key 为无前缀 token 名（如 color-primary / color-button-primary-bg-hover）→ 值。
  // 全局层 + 组件层的改动统一汇入这里，一并注入预览容器的 scoped 变量。
  let overrides = $state<Record<string, string>>({});

  // 预览区局部 token 覆写：在用户覆写基础上扩散出传递引用它们的组件 token
  // （带原始 var() 值），使 scoped 注入下组件也能级联联动（见 tokens.ts 说明）。
  // ConfigProvider 已对齐 Semi（无 tokens prop），这里直接在预览容器上注入 scoped
  // CSS 变量（--cd-<key>），仅作用于该子树、不污染全局。
  const themeTokens = $derived(expandOverridesForPreview(overrides));
  const previewTokenStyle = $derived(
    Object.entries(themeTokens)
      .map(([k, v]) => `--cd-${k}: ${v}`)
      .join('; '),
  );

  function keyOf(name: string): string {
    return name.replace(/^--cd-/, '');
  }

  function setOverride(name: string, value: string) {
    const k = keyOf(name);
    if (value === '') {
      const next = { ...overrides };
      delete next[k];
      overrides = next;
    } else {
      overrides = { ...overrides, [k]: value };
    }
  }

  function reset() {
    overrides = {};
  }

  const overrideCount = $derived(Object.keys(overrides).length);

  // 导出：一段可直接使用的 CSS 变量覆写（全局 + 组件所有 overrides）。
  const exportCss = $derived.by(() => {
    const entries = Object.entries(overrides);
    if (entries.length === 0) return '/* 尚无覆写 */';
    const lines = entries.map(([k, v]) => `  --cd-${k}: ${v};`);
    return `:root {\n${lines.join('\n')}\n}`;
  });

  let copied = $state(false);
  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportCss);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      // 剪贴板不可用时忽略
    }
  }

  // 判断某 token 是否走颜色输入（category=color 且解析值像颜色）。
  function isColor(t: ManifestToken): boolean {
    return t.category === 'color' && /^(#|rgb)/.test(t.resolvedLight);
  }

  // color input 需要 hex；把 resolved 值尽量转成 hex 作为初值（rgb→hex 简单处理，失败回退 #000000）。
  function toHex(v: string): string {
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) {
      const h = (n: string) => Number(n).toString(16).padStart(2, '0');
      return `#${h(m[1]!)}${h(m[2]!)}${h(m[3]!)}`;
    }
    return '#000000';
  }

  // ── tab / 组件选择 ────────────────────────────────────────────
  type Tab = 'global' | 'component';
  let tab = $state<Tab>('global');

  const globalGroups = groupAlias();

  let selectedComponent = $state(componentList[0]?.dir ?? '');
  let componentFilter = $state('');

  const filteredComponents = $derived(
    componentFilter.trim() === ''
      ? componentList
      : componentList.filter((c) =>
          c.dir.toLowerCase().includes(componentFilter.trim().toLowerCase()),
        ),
  );

  const currentGroups = $derived(
    selectedComponent ? componentTokens(selectedComponent) : [],
  );

  // ── 预览：组件名 → 是否有专属预览 ─────────────────────────────
  // 有专属预览渲染的组件集合（其余退化为占位）。
  const PREVIEWABLE = new Set([
    'button',
    'input',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'switch',
    'tag',
    'avatar',
    'badge',
    'modal',
    'tooltip',
    'slider',
    'progress',
    'tabs',
  ]);

  // 组件层预览标的：把碎片/别名 dir 映射到实际有预览的键。
  const PREVIEW_KEY: Record<string, string> = {
    'date-picker': 'input',
    'time-picker': 'input',
    autocomplete: 'input',
    'side-sheet': 'modal',
    popover: 'tooltip',
    popconfirm: 'tooltip',
    dropdown: 'tooltip',
    spin: 'progress',
    steps: 'progress',
    banner: 'tag',
    breadcrumb: 'tag',
  };

  const previewKey = $derived(
    tab === 'global'
      ? 'global'
      : (PREVIEW_KEY[selectedComponent] ?? selectedComponent),
  );

  const hasPreview = $derived(tab === 'global' || PREVIEWABLE.has(previewKey));

  // 预览用的示例状态（不影响 overrides）。
  let demoChecked = $state(true);
  let demoRadio = $state('a');
  let demoSwitch = $state(true);
  let demoSlider = $state(40);
  let demoSelect = $state('opt1');
  let demoTab = $state('t1');
  let modalOpen = $state(false);

  const selectOptions = [
    { label: '选项一', value: 'opt1' },
    { label: '选项二', value: 'opt2' },
    { label: '选项三', value: 'opt3' },
  ];
</script>

<svelte:head>
  <title>DSM 主题编辑器 — chenzy-design</title>
</svelte:head>

<div class="dsm">
  <div class="dsm-editor">
    <div class="dsm-head">
      <h1>DSM 主题编辑器</h1>
      <p class="sub">
        编辑全局语义色与各组件设计变量，实时预览、导出主题。全局层 {aliasTokens.length} 个 alias · 组件层
        {componentList.length} 个组件。
      </p>
      <div class="actions">
        <span class="count">{overrideCount} 项覆写</span>
        <button class="btn-reset" onclick={reset} disabled={overrideCount === 0}>重置</button>
      </div>
    </div>

    <div class="tabs" role="tablist">
      <button
        class="tab"
        class:active={tab === 'global'}
        role="tab"
        aria-selected={tab === 'global'}
        onclick={() => (tab = 'global')}
      >
        全局
      </button>
      <button
        class="tab"
        class:active={tab === 'component'}
        role="tab"
        aria-selected={tab === 'component'}
        onclick={() => (tab = 'component')}
      >
        组件
      </button>
    </div>

    {#if tab === 'global'}
      {#each globalGroups as group (group.key)}
        <section class="cat">
          <h2>{group.title}</h2>
          {#each group.items as t (t.name)}
            {@const k = keyOf(t.name)}
            <div class="row">
              <div class="meta">
                <code class="tname">{t.name}</code>
                <span class="usage">{t.usage || t.label}</span>
              </div>
              <div class="control">
                {#if isColor(t)}
                  <input
                    type="color"
                    value={overrides[k] ?? toHex(t.resolvedLight)}
                    oninput={(e) => setOverride(t.name, e.currentTarget.value)}
                  />
                {/if}
                <input
                  type="text"
                  class="txt"
                  placeholder={t.resolvedLight}
                  value={overrides[k] ?? ''}
                  oninput={(e) => setOverride(t.name, e.currentTarget.value)}
                />
              </div>
            </div>
          {/each}
        </section>
      {/each}
    {:else}
      <div class="comp-picker">
        <input
          type="text"
          class="comp-search"
          placeholder="搜索组件…"
          bind:value={componentFilter}
        />
        <select class="comp-select" bind:value={selectedComponent}>
          {#each filteredComponents as c (c.dir)}
            <option value={c.dir}>{c.dir} ({c.count})</option>
          {/each}
        </select>
      </div>

      {#if currentGroups.length === 0}
        <p class="empty-hint">该组件无可编辑 token。</p>
      {/if}

      {#each currentGroups as group (group.cat)}
        <section class="cat">
          <h2>{group.cat}</h2>
          {#each group.items as t (t.name)}
            {@const k = keyOf(t.name)}
            <div class="row">
              <div class="meta">
                <code class="tname">{t.name}</code>
                <span class="usage">{t.usage || t.label}</span>
              </div>
              <div class="control">
                {#if isColor(t)}
                  <input
                    type="color"
                    value={overrides[k] ?? toHex(t.resolvedLight)}
                    oninput={(e) => setOverride(t.name, e.currentTarget.value)}
                  />
                {/if}
                <input
                  type="text"
                  class="txt"
                  placeholder={t.resolvedLight}
                  value={overrides[k] ?? ''}
                  oninput={(e) => setOverride(t.name, e.currentTarget.value)}
                />
              </div>
            </div>
          {/each}
        </section>
      {/each}
    {/if}
  </div>

  <div class="dsm-preview">
    <div class="preview-sticky">
      <h2>预览{tab === 'component' ? ` · ${selectedComponent}` : ''}</h2>
      <div class="preview-stage" style={previewTokenStyle}>
        {#if previewKey === 'global'}
            <!-- 全局层：混合一组代表性组件，体现全局色联动 -->
            <div class="prow">
              <Button type="primary">Primary</Button>
              <Button type="secondary">Secondary</Button>
              <Button type="tertiary">Tertiary</Button>
              <Button type="warning">Warning</Button>
              <Button type="danger">Danger</Button>
            </div>
            <div class="prow">
              <Tag color="blue">Primary</Tag>
              <Tag color="green">Success</Tag>
              <Tag color="red">Danger</Tag>
              <Badge count={5}><Avatar size="small">CD</Avatar></Badge>
              <Switch bind:value={demoSwitch} />
              <Checkbox bind:checked={demoChecked}>选择</Checkbox>
            </div>
            <div class="prow">
              <div class="w160"><Input placeholder="输入框" /></div>
              <div class="w160"><Select bind:value={demoSelect} options={selectOptions} /></div>
            </div>
            <div class="prow slider-row">
              <Slider bind:value={demoSlider} />
            </div>
            <div class="prow">
              <Progress percent={demoSlider} />
            </div>
          {:else if previewKey === 'button'}
            <div class="prow">
              <Button type="primary">Primary</Button>
              <Button type="secondary">Secondary</Button>
              <Button type="tertiary">Tertiary</Button>
              <Button type="warning">Warning</Button>
              <Button type="danger">Danger</Button>
            </div>
            <div class="prow">
              <Button type="primary" theme="light">Light</Button>
              <Button type="primary" theme="borderless">Borderless</Button>
              <Button type="primary" disabled>Disabled</Button>
              <Button type="primary" loading>Loading</Button>
            </div>
            <div class="prow">
              <Button type="primary" size="small">Small</Button>
              <Button type="primary">Default</Button>
              <Button type="primary" size="large">Large</Button>
            </div>
          {:else if previewKey === 'input' || previewKey === 'textarea'}
            <div class="prow">
              <div class="w200"><Input placeholder="默认输入框" /></div>
            </div>
            <div class="prow">
              <div class="w200"><Input value="已填内容" /></div>
              <div class="w120"><Input placeholder="禁用" disabled /></div>
            </div>
            <div class="prow">
              <div class="w200"><Input placeholder="警告态" validateStatus="error" /></div>
            </div>
          {:else if previewKey === 'select'}
            <div class="prow">
              <div class="w200"><Select bind:value={demoSelect} options={selectOptions} /></div>
            </div>
            <div class="prow">
              <div class="w200"><Select options={selectOptions} placeholder="请选择" /></div>
            </div>
          {:else if previewKey === 'checkbox'}
            <div class="prow">
              <Checkbox bind:checked={demoChecked}>选项 A</Checkbox>
              <Checkbox checked>已选</Checkbox>
              <Checkbox disabled>禁用</Checkbox>
            </div>
          {:else if previewKey === 'radio'}
            <div class="prow">
              <RadioGroup bind:value={demoRadio}>
                <Radio value="a">选项 A</Radio>
                <Radio value="b">选项 B</Radio>
                <Radio value="c" disabled>禁用</Radio>
              </RadioGroup>
            </div>
          {:else if previewKey === 'switch'}
            <div class="prow">
              <Switch bind:value={demoSwitch} />
              <Switch value />
              <Switch disabled />
              <Switch value disabled />
            </div>
            <div class="prow">
              <Switch size="small" value />
              <Switch size="large" value />
            </div>
          {:else if previewKey === 'tag'}
            <div class="prow">
              <Tag color="blue">Primary</Tag>
              <Tag color="green">Success</Tag>
              <Tag color="orange">Warning</Tag>
              <Tag color="red">Danger</Tag>
            </div>
            <div class="prow">
              <Tag type="light" color="blue">Light</Tag>
              <Tag type="ghost" color="blue">Ghost</Tag>
              <Tag type="solid" color="blue">Solid</Tag>
              <Tag closable>可关闭</Tag>
            </div>
          {:else if previewKey === 'avatar'}
            <div class="prow">
              <Avatar size="small">CD</Avatar>
              <Avatar>AB</Avatar>
              <Avatar size="large" color="light-blue">LG</Avatar>
              <Avatar color="red">RD</Avatar>
              <Avatar color="green">GR</Avatar>
            </div>
          {:else if previewKey === 'badge'}
            <div class="prow">
              <Badge count={5}><Avatar>CD</Avatar></Badge>
              <Badge count={99}><Avatar>AB</Avatar></Badge>
              <Badge dot><Avatar>DT</Avatar></Badge>
            </div>
          {:else if previewKey === 'modal'}
            <div class="prow">
              <Button type="primary" onclick={() => (modalOpen = true)}>打开弹窗</Button>
            </div>
            <Modal
              title="标题"
              visible={modalOpen}
              onOk={() => (modalOpen = false)}
              onCancel={() => (modalOpen = false)}
            >
              <p>这是弹窗内容，改动组件 token 会即时反映在此。</p>
            </Modal>
          {:else if previewKey === 'tooltip'}
            <div class="prow">
              <Tooltip content="提示文字">
                <Button>悬停显示提示</Button>
              </Tooltip>
            </div>
          {:else if previewKey === 'slider'}
            <div class="prow slider-row">
              <Slider bind:value={demoSlider} />
            </div>
          {:else if previewKey === 'progress'}
            <div class="prow">
              <Progress percent={demoSlider} />
            </div>
            <div class="prow slider-row">
              <Slider bind:value={demoSlider} />
            </div>
          {:else if previewKey === 'tabs'}
            <Tabs activeKey={demoTab} onChange={(k) => (demoTab = String(k))}>
              <TabPane tab="标签一" itemKey="t1">
                <p>内容一</p>
              </TabPane>
              <TabPane tab="标签二" itemKey="t2">
                <p>内容二</p>
              </TabPane>
              <TabPane tab="标签三" itemKey="t3">
                <p>内容三</p>
              </TabPane>
            </Tabs>
          {:else}
            <div class="preview-fallback">
              该组件暂无预览，仍可编辑 token 并导出。
            </div>
        {/if}
      </div>

      {#if !hasPreview}
        <p class="fallback-note">「{selectedComponent}」暂无专属预览，token 编辑与导出照常可用。</p>
      {/if}

      <h2>导出</h2>
      <div class="export">
        <button class="btn-copy" onclick={copyExport}>{copied ? '已复制 ✓' : '复制 CSS'}</button>
        <pre class="export-code">{exportCss}</pre>
      </div>
    </div>
  </div>
</div>

<style>
  .dsm {
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }
  .dsm-editor {
    flex: 1;
    min-width: 0;
    max-width: 640px;
  }
  .dsm-preview {
    width: 460px;
    flex-shrink: 0;
  }
  .preview-sticky {
    position: sticky;
    top: 84px;
  }
  .dsm-head {
    margin-bottom: 16px;
  }
  h1 {
    font-size: 24px;
    margin: 0 0 4px;
  }
  .sub {
    color: var(--cd-color-text-2, #86909c);
    font-size: 13px;
    margin: 0 0 12px;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .count {
    font-size: 13px;
    color: var(--cd-color-primary, #0064fa);
  }
  .btn-reset,
  .btn-copy {
    padding: 4px 12px;
    font-size: 13px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    background: var(--cd-color-bg-0, #fff);
    cursor: pointer;
  }
  .btn-reset:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .tab {
    padding: 8px 16px;
    font-size: 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--cd-color-text-2, #86909c);
    cursor: pointer;
    margin-bottom: -1px;
  }
  .tab.active {
    color: var(--cd-color-primary, #0064fa);
    border-bottom-color: var(--cd-color-primary, #0064fa);
    font-weight: 600;
  }
  .comp-picker {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .comp-search {
    flex: 1;
    min-width: 0;
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
  }
  .comp-select {
    width: 200px;
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    background: var(--cd-color-bg-0, #fff);
  }
  .empty-hint,
  .fallback-note {
    font-size: 13px;
    color: var(--cd-color-text-3, #a9aeb8);
  }
  .cat {
    margin-bottom: 20px;
  }
  .cat h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--cd-color-text-2, #86909c);
    margin: 0 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--cd-color-border, #e5e7eb);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
  }
  .meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .tname {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--cd-color-text-1, #4e5969);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .usage {
    font-size: 11px;
    color: var(--cd-color-text-3, #a9aeb8);
  }
  .control {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  input[type='color'] {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }
  .txt {
    width: 150px;
    padding: 4px 8px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
  }
  .preview-stage {
    padding: 24px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    background: var(--cd-color-bg-1, #f7f8fa);
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }
  .prow {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  .slider-row {
    display: block;
  }
  .w120 {
    width: 120px;
  }
  .w160 {
    width: 160px;
  }
  .w200 {
    width: 200px;
  }
  .preview-fallback {
    font-size: 13px;
    color: var(--cd-color-text-3, #a9aeb8);
    text-align: center;
    padding: 24px 0;
  }
  .export-code {
    margin: 8px 0 0;
    padding: 12px;
    background: var(--cd-color-fill-1, #f2f3f5);
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre;
    max-height: 300px;
  }
</style>
