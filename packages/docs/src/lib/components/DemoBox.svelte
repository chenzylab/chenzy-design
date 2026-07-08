<script lang="ts">
  import type { Snippet } from 'svelte';
  import { LocaleProvider, CodeHighlight, zh_CN, en_US } from '@chenzy-design/svelte';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);
  // demo 内组件的内置文案跟随文档站语言（zh→zh_CN / en→en_US），
  // 否则 useLocale() 无 Provider 会回退 en_US，导致中文页面里组件文案仍是英文。
  const demoLocale = $derived(lang === 'zh' ? zh_CN : en_US);

  const {
    title,
    description,
    code,
    highlightLines,
    children,
  }: {
    title?: string;
    description?: string;
    code?: string;
    /** 高亮的重点参数行号（1-based），如 [3, 5] 高亮当前 demo 的关键 prop 行。 */
    highlightLines?: number[];
    children: Snippet;
  } = $props();

  let showCode = $state(false);
  let copied = $state(false);

  // 重点行高亮：把行号列表下发为 CSS 变量，由 .demo-box__code 的样式对相应行做背景高亮（阶段 3）。
  const highlightLinesVar = $derived(
    highlightLines && highlightLines.length > 0
      ? `--demo-hl-lines: ${highlightLines.join(' ')}`
      : undefined,
  );

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      copied = false;
    }
  }
</script>

<div class="demo-box">
  {#if title}
    <div class="demo-box__title">{title}</div>
  {/if}
  {#if description}
    <p class="demo-box__desc">{description}</p>
  {/if}
  <div class="demo-box__preview">
    <LocaleProvider locale={demoLocale}>
      {@render children()}
    </LocaleProvider>
  </div>
  <div class="demo-box__footer">
    {#if code}
      <button class="demo-box__toggle" onclick={() => (showCode = !showCode)}>
        {showCode ? `${t('demo.hideSource', lang)} ▲` : `${t('demo.viewSource', lang)} ▼`}
      </button>
      {#if showCode}
        <button class="demo-box__toggle" onclick={copyCode}>
          {copied ? `${t('demo.copied', lang)} ✓` : t('demo.copy', lang)}
        </button>
      {/if}
    {/if}
  </div>
  {#if showCode && code}
    <div class="demo-box__code" style={highlightLinesVar}>
      <CodeHighlight {code} language="svelte" lineNumber class="demo-box__codehl" />
    </div>
  {/if}
</div>

<style>
  .demo-box {
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    margin-bottom: 24px;
    overflow: hidden;
  }
  .demo-box__title {
    padding: 12px 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--cd-color-text-0, #1f2329);
  }
  .demo-box__desc {
    padding: 4px 16px 0;
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    margin: 0;
  }
  .demo-box__preview {
    padding: 24px 16px;
  }
  .demo-box__footer {
    border-top: 1px solid var(--cd-color-border, #e5e7eb);
    padding: 8px 16px;
    display: flex;
    gap: 16px;
  }
  .demo-box__toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    padding: 0;
  }
  .demo-box__toggle:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  /* 源码区：CodeHighlight（Prism）自带主题背景与行号，DemoBox 仅加分隔边框。 */
  .demo-box__code {
    border-top: 1px solid var(--cd-color-border, #e5e7eb);
    overflow-x: auto;
  }
  .demo-box__code :global(.demo-box__codehl) {
    margin: 0;
    border-radius: 0;
  }
</style>
