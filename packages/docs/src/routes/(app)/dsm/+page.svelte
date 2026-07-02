<script lang="ts">
  import { Button, ConfigProvider } from '@chenzy-design/svelte';
  import manifest from '@chenzy-design/tokens/token-manifest.json';

  interface ManifestToken {
    name: string;
    value: string;
    resolvedLight: string;
    category: string;
    component: string | null;
    label: string;
    usage: string;
    editable: boolean;
    scope: string;
  }

  // P0 试点：只编辑 Button 组件的可编辑 token。
  const tokens = (manifest.tokens as ManifestToken[]).filter(
    (t) => t.component === 'button' && t.editable,
  );

  // 按分类分组（对齐 DSM 编辑器左侧结构）。
  const CATS = ['color', 'font', 'height', 'width', 'spacing', 'radius', 'animation'] as const;
  const grouped = CATS.map((cat) => ({
    cat,
    items: tokens.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  // 覆写状态：key 为无前缀 token 名（如 color-button-primary-bg-hover）→ 值。
  let overrides = $state<Record<string, string>>({});

  // 传给 ConfigProvider 的覆写（去掉 --cd- 前缀）。仅含用户真正改过的项。
  const themeTokens = $derived(overrides);

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

  // 导出：一段可直接使用的 CSS 变量覆写。
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
</script>

<svelte:head>
  <title>DSM 主题编辑器（P0·Button）— chenzy-design</title>
</svelte:head>

<div class="dsm">
  <div class="dsm-editor">
    <div class="dsm-head">
      <h1>DSM 主题编辑器</h1>
      <p class="sub">P0 试点：编辑 Button 的设计变量，实时预览、导出主题。共 {tokens.length} 个可编辑 token。</p>
      <div class="actions">
        <span class="count">{overrideCount} 项覆写</span>
        <button class="btn-reset" onclick={reset} disabled={overrideCount === 0}>重置</button>
      </div>
    </div>

    {#each grouped as group (group.cat)}
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
  </div>

  <div class="dsm-preview">
    <div class="preview-sticky">
      <h2>预览</h2>
      <ConfigProvider tokens={themeTokens} wrap>
        <div class="preview-stage">
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
        </div>
      </ConfigProvider>

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
    margin-bottom: 24px;
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
    margin-bottom: 24px;
  }
  .prow {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
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
  }
</style>
