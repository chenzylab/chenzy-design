<script lang="ts">
  // 标题旁的「复制链接」锚点按钮：hover 到所在 section 时显示，
  // 点击复制该章节的分享链接（带 #id）。访问该链接后 hash 会被清掉。
  const { id }: { id: string } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  // execCommand 兜底：非安全上下文或 clipboard API 不可用时用临时 textarea。
  function legacyCopy(text: string): boolean {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function copy() {
    const url = `${location.origin}${location.pathname}#${id}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = legacyCopy(url);
    }
    if (!ok) return; // 两种方式都失败：不改 URL、不留 hash，保持干净
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1500);
  }
</script>

<button
  class="section-anchor"
  class:copied
  type="button"
  onclick={copy}
  aria-label={copied ? '已复制链接' : '复制本节链接'}
  title={copied ? '已复制' : '复制链接'}
>
  {#if copied}
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {:else}
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.5 9.5a2.5 2.5 0 003.54 0l2-2a2.5 2.5 0 00-3.54-3.54l-.7.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.5 6.5a2.5 2.5 0 00-3.54 0l-2 2a2.5 2.5 0 003.54 3.54l.7-.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {/if}
</button>

<style>
  .section-anchor {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-left: 8px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--cd-color-text-3, #a9aeb8);
    cursor: pointer;
    vertical-align: middle;
    /* 默认隐藏，hover 所在标题时淡入 */
    opacity: 0;
    transition: opacity 0.15s, color 0.15s, background 0.15s;
  }
  .section-anchor:hover {
    background: var(--cd-color-fill-1, #f2f3f5);
    color: var(--cd-color-primary, #0064fa);
  }
  .section-anchor.copied {
    opacity: 1;
    color: var(--cd-color-success, #00b42a);
  }
  /* 由父级 h2 的 hover 控制显隐（见 +page.svelte 的 .section h2:hover 规则） */
</style>
