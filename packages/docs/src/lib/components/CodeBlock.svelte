<script lang="ts">
  import { highlight } from '$lib/highlight';
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  const { code, codeLang = 'svelte' }: { code: string; codeLang?: string } = $props();

  let highlighted = $state<string | null>(null);
  let copied = $state(false);

  $effect(() => {
    highlight(code, codeLang).then((html) => {
      highlighted = html;
    });
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      copied = false;
    }
  }
</script>

<div class="code-block">
  <button class="code-block__copy" onclick={copy}>
    {copied ? `${t('demo.copied', lang)} ✓` : t('demo.copy', lang)}
  </button>
  <div class="code-block__code">
    {#if highlighted}
      {@html highlighted}
    {:else}
      <pre class="code-block__raw">{code}</pre>
    {/if}
  </div>
</div>

<style>
  .code-block {
    position: relative;
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 8px;
    background: var(--shiki-light-bg, var(--cd-color-fill-0, #f7f8fa));
    overflow: hidden;
  }
  .code-block__copy {
    position: absolute;
    top: 8px;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
    z-index: 1;
  }
  .code-block__copy:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  .code-block__code {
    font-size: 13px;
    overflow-x: auto;
  }
  .code-block__code :global(.shiki) {
    margin: 0;
    padding: 16px;
    background-color: transparent !important;
  }
  .code-block__code :global(.shiki),
  .code-block__code :global(.shiki span) {
    color: var(--shiki-light, inherit);
  }
  .code-block__raw {
    margin: 0;
    padding: 16px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre;
  }
  :global([data-theme='dark']) .code-block {
    background: var(--shiki-dark-bg, var(--cd-color-fill-0, #1f1f1f));
  }
  :global([data-theme='dark']) .code-block__code :global(.shiki),
  :global([data-theme='dark']) .code-block__code :global(.shiki span) {
    color: var(--shiki-dark, inherit);
  }
</style>
