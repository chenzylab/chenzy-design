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
    /** 高亮的重点参数行号（1-based），由 demos.ts entry 声明，如 [12, 22]。 */
    highlightLines?: number[];
    children: Snippet;
  } = $props();

  let showCode = $state(false);
  let copied = $state(false);

  const hasHighlight = $derived((highlightLines?.length ?? 0) > 0);

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
    <div class="demo-box__code" class:demo-box__code--has-hl={hasHighlight}>
      {#if hasHighlight}
        <!-- 重点行高亮：基于 line-numbers 等宽行高的绝对定位背景条（对齐 VitePress 整行高亮观感）。 -->
        <div class="demo-box__hl-layer" aria-hidden="true">
          {#each highlightLines ?? [] as ln (ln)}
            <span class="demo-box__hl-line" style="--hl-line: {ln}"></span>
          {/each}
        </div>
      {/if}
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
    background: var(--cd-color-bg-1);
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
    position: relative;
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
    position: relative;
    border-top: 1px solid var(--cd-color-border, #e5e7eb);
    overflow-x: auto;
  }
  .demo-box__code :global(.demo-box__codehl) {
    margin: 0;
    border-radius: 0;
  }
  /* 重点行高亮层：绝对定位的整行背景条，与 CodeHighlight 的等宽行高对齐（对齐 VitePress 观感）。
     行高取 CodeHighlight 的 token；顶部偏移 = pre padding（16px，见 CodeHighlight 样式）。 */
  .demo-box__hl-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .demo-box__hl-line {
    position: absolute;
    inset-inline: 0;
    block-size: var(--cd-code-highlight-line-height, 1.5em);
    inset-block-start: calc(
      16px + (var(--hl-line) - 1) * var(--cd-code-highlight-line-height, 1.5em)
    );
    background: var(--cd-color-primary-light-default, rgba(0, 100, 250, 0.08));
  }
  /* 代码浮在高亮层之上 */
  .demo-box__code :global(.demo-box__codehl) {
    position: relative;
    z-index: 1;
    background: transparent;
  }
</style>
