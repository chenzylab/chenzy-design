<script lang="ts">
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  const installCmd = 'pnpm add @chenzy-design/svelte @chenzy-design/tokens';

  const importCss = `<script>
  import '@chenzy-design/tokens/tokens.css';
  let { children } = $props();
<\/script>
{@render children()}`;

  const usage = `<script lang="ts">
  import { Button, Input } from '@chenzy-design/svelte';
  let text = $state('');
<\/script>

<Button type="primary">主要按钮</Button>
<Input bind:value={text} placeholder="请输入" />`;

  let copied = $state('');
  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text);
    copied = key;
    setTimeout(() => (copied = ''), 1500);
  }
</script>

<svelte:head>
  <title>{t('home.headTitle', lang)}</title>
</svelte:head>

<div class="hero">
  <h1>chenzy-design</h1>
  <p class="tagline">{t('home.tagline', lang)}</p>
  <p class="meta">{t('home.metaTags', lang, { n: componentsJson.count })}</p>
  <div class="actions">
    <a class="btn btn--primary" href="{base}/components">{t('home.browseAll', lang)}</a>
    <a class="btn" href="https://github.com/chenzylab/chenzy-design" target="_blank" rel="noreferrer">GitHub</a>
  </div>
</div>

<section class="quickstart">
  <h2>{t('home.quickstart', lang)}</h2>

  <div class="step">
    <h3><span class="step-num">1</span> {t('home.step1', lang)}</h3>
    <div class="code-block">
      <pre><code>{installCmd}</code></pre>
      <button class="copy-btn" onclick={() => copy(installCmd, 'install')}>
        {copied === 'install' ? t('home.copied', lang) : t('home.copy', lang)}
      </button>
    </div>
  </div>

  <div class="step">
    <h3><span class="step-num">2</span> {t('home.step2', lang)}</h3>
    <p class="hint">{@html t('home.step2Hint', lang)}</p>
    <div class="code-block">
      <pre><code>{importCss}</code></pre>
      <button class="copy-btn" onclick={() => copy(importCss, 'css')}>
        {copied === 'css' ? t('home.copied', lang) : t('home.copy', lang)}
      </button>
    </div>
  </div>

  <div class="step">
    <h3><span class="step-num">3</span> {t('home.step3', lang)}</h3>
    <div class="code-block">
      <pre><code>{usage}</code></pre>
      <button class="copy-btn" onclick={() => copy(usage, 'usage')}>
        {copied === 'usage' ? t('home.copied', lang) : t('home.copy', lang)}
      </button>
    </div>
  </div>

  <p class="note">{@html t('home.note', lang)}</p>
</section>

<style>
  .hero { padding: 24px 0 40px; border-bottom: 1px solid var(--cd-color-border, #e5e7eb); margin-bottom: 40px; }
  h1 { font-size: 40px; margin: 0 0 12px; }
  .tagline { font-size: 18px; color: var(--cd-color-text-0, #1f2329); margin: 0 0 8px; }
  .meta { font-size: 14px; color: var(--cd-color-text-2, #86909c); margin: 0 0 24px; }
  .actions { display: flex; gap: 12px; }
  .btn {
    display: inline-block; padding: 8px 20px; border-radius: 6px; font-size: 14px;
    text-decoration: none; border: 1px solid var(--cd-color-border, #e5e7eb);
    color: var(--cd-color-text-0, #1f2329); background: var(--cd-color-bg-0, #fff);
  }
  .btn:hover { border-color: var(--cd-color-primary, #165dff); color: var(--cd-color-primary, #165dff); }
  .btn--primary { background: var(--cd-color-primary, #165dff); color: #fff; border-color: var(--cd-color-primary, #165dff); }
  .btn--primary:hover { opacity: 0.9; color: #fff; }

  .quickstart h2 { font-size: 22px; margin: 0 0 24px; }
  .step { margin-bottom: 28px; }
  .step h3 { font-size: 16px; margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
  .step-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%; font-size: 13px;
    background: var(--cd-color-primary, #165dff); color: #fff;
  }
  .hint { font-size: 13px; color: var(--cd-color-text-2, #86909c); margin: 0 0 10px; }
  .hint code, .note code { background: var(--cd-color-fill-1, #f2f3f5); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  .code-block { position: relative; }
  .code-block pre {
    background: var(--cd-color-fill-1, #f7f8fa); border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px; padding: 16px; overflow-x: auto; margin: 0;
  }
  .code-block code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 13px; color: var(--cd-color-text-0, #1f2329); line-height: 1.6; }
  .copy-btn {
    position: absolute; top: 10px; right: 10px; padding: 4px 12px; font-size: 12px;
    border: 1px solid var(--cd-color-border, #e5e7eb); border-radius: 6px; cursor: pointer;
    background: var(--cd-color-bg-0, #fff); color: var(--cd-color-text-1, #4e5969);
  }
  .copy-btn:hover { border-color: var(--cd-color-primary, #165dff); color: var(--cd-color-primary, #165dff); }
  .note { font-size: 13px; color: var(--cd-color-text-1, #4e5969); margin-top: 24px; padding: 12px 16px; background: var(--cd-color-fill-1, #f7f8fa); border-radius: 8px; }
</style>
