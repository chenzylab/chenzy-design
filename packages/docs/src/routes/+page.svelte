<script lang="ts">
  import { base } from '$app/paths';
  import componentsJson from '@chenzy-design/svelte/components.json';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);
  const count = componentsJson.count;

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

  // 核心特性卡片（对齐 Semi 落地页）
  const features = $derived([
    { key: 'ready', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', n: count },
    { key: 'theme', icon: 'M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z M7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM16.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
    { key: 'dark', icon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z' },
    { key: 'i18n', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.8 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.8-3.5-9s1-6.5 3.5-9z' },
    { key: 'a11y', icon: 'M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 8h16M9 8l-1 12M15 8l1 12M9.5 13h5' },
    { key: 'svelte', icon: 'M13 3L4 14h6l-1 7 9-11h-6z' },
  ]);

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

<div class="home">
  <!-- Hero -->
  <section class="hero">
    <h1>{t('home.heroTitle', lang)}</h1>
    <p class="subtitle">{t('home.heroSubtitle', lang)}</p>
    <div class="actions">
      <a class="btn btn--primary" href="{base}/guide/getting-started">{t('home.getStarted', lang)}</a>
      <a class="btn" href="{base}/components">{t('home.viewComponents', lang)}</a>
    </div>
    <p class="meta">{t('home.metaTags', lang, { n: count })}</p>
  </section>

  <!-- 核心特性 -->
  <section class="features">
    <h2>{t('home.featuresTitle', lang)}</h2>
    <div class="feature-grid">
      {#each features as f (f.key)}
        <div class="feature-card">
          <span class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d={f.icon} />
            </svg>
          </span>
          <h3>{t(`home.feat.${f.key}.t`, lang)}</h3>
          <p>{t(`home.feat.${f.key}.d`, lang, { n: count })}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- 快速开始 -->
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
</div>

<style>
  .home {
    max-width: 1040px;
    margin: 0 auto;
  }

  /* Hero：渐变背景的居中落地区，对齐 Semi 营销首页观感 */
  .hero {
    text-align: center;
    padding: 72px 24px 64px;
    margin-bottom: 24px;
    border-radius: 16px;
    background:
      radial-gradient(60% 80% at 50% 0%, var(--cd-color-primary-light-1, #eaf5ff) 0%, transparent 70%),
      var(--cd-color-bg-0, #fff);
  }
  .hero h1 {
    font-size: 48px;
    line-height: 1.2;
    margin: 0 0 20px;
    font-weight: 800;
    white-space: pre-line;
    letter-spacing: -0.5px;
  }
  .subtitle {
    font-size: 17px;
    line-height: 1.7;
    color: var(--cd-color-text-1, #4e5969);
    max-width: 600px;
    margin: 0 auto 28px;
  }
  .actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 20px;
  }
  .btn {
    display: inline-block;
    padding: 11px 28px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    color: var(--cd-color-text-0, #1f2329);
    background: var(--cd-color-bg-0, #fff);
    transition: all 0.15s;
  }
  .btn:hover {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
  }
  .btn--primary {
    background: var(--cd-color-primary, #0064fa);
    color: #fff;
    border-color: var(--cd-color-primary, #0064fa);
    box-shadow: 0 4px 14px color-mix(in srgb, var(--cd-color-primary, #0064fa) 30%, transparent);
  }
  .btn--primary:hover {
    background: var(--cd-color-primary-hover, #0062d6);
    color: #fff;
    border-color: var(--cd-color-primary-hover, #0062d6);
  }
  .meta {
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    margin: 0;
  }

  /* 特性卡片网格 */
  .features {
    padding: 24px 0 8px;
  }
  .features h2,
  .quickstart h2 {
    font-size: 24px;
    margin: 0 0 24px;
    text-align: center;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .feature-card {
    padding: 24px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 12px;
    background: var(--cd-color-bg-0, #fff);
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .feature-card:hover {
    border-color: var(--cd-color-primary, #0064fa);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    margin-bottom: 14px;
    background: var(--cd-color-primary-light-1, #eaf5ff);
    color: var(--cd-color-primary, #0064fa);
  }
  .feature-card h3 {
    font-size: 16px;
    margin: 0 0 8px;
  }
  .feature-card p {
    font-size: 13px;
    line-height: 1.7;
    color: var(--cd-color-text-2, #86909c);
    margin: 0;
  }

  /* 快速开始 */
  .quickstart {
    padding: 48px 0 24px;
  }
  .step {
    margin-bottom: 28px;
  }
  .step h3 {
    font-size: 16px;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 13px;
    background: var(--cd-color-primary, #0064fa);
    color: #fff;
  }
  .hint {
    font-size: 13px;
    color: var(--cd-color-text-2, #86909c);
    margin: 0 0 10px;
  }
  .hint :global(code),
  .note :global(code) {
    background: var(--cd-color-fill-1, #f2f3f5);
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
  }
  .code-block {
    position: relative;
  }
  .code-block pre {
    background: var(--cd-color-fill-1, #f7f8fa);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin: 0;
  }
  .code-block code {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 13px;
    color: var(--cd-color-text-0, #1f2329);
    line-height: 1.6;
  }
  .copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 12px;
    font-size: 12px;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    cursor: pointer;
    background: var(--cd-color-bg-0, #fff);
    color: var(--cd-color-text-1, #4e5969);
  }
  .copy-btn:hover {
    border-color: var(--cd-color-primary, #0064fa);
    color: var(--cd-color-primary, #0064fa);
  }
  .note {
    font-size: 13px;
    color: var(--cd-color-text-1, #4e5969);
    margin-top: 24px;
    padding: 12px 16px;
    background: var(--cd-color-fill-1, #f7f8fa);
    border-radius: 8px;
  }

  @media (max-width: 860px) {
    .feature-grid {
      grid-template-columns: 1fr;
    }
    .hero h1 {
      font-size: 36px;
    }
  }
</style>
