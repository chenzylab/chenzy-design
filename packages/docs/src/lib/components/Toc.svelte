<script lang="ts">
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';
  import { saveScrollSection } from '$lib/scroll-restore';

  const lang = $derived(locale.value);

  interface TocSection {
    id: string;
    title: string;
    /** 1=顶级章节，2=子项（如代码演示下的各场景），用于缩进 */
    level?: number;
  }

  const { sections = [] }: { sections?: TocSection[] } = $props();

  let activeId = $state<string>('');

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 记住当前章节以便刷新恢复（存 sessionStorage，不污染 URL）。
      saveScrollSection(id);
      // 立即高亮，避免等待 observer 回调的延迟
      activeId = id;
    }
  }

  // 顶部激活线：标题滚到距视口顶 <= 此值即视为「当前章节」（与 section
  // 的 scroll-margin-top:80px 对齐，略放宽避免临界抖动）。
  const ACTIVATE_OFFSET = 88;

  $effect(() => {
    // 依赖 sections，sections 变化时重新绑定
    const ids = sections.map((s) => s.id);
    if (ids.length === 0) return;

    // 用滚动位置直接判定「当前章节」：取顶部已越过激活线的最后一个 section。
    // 比 IntersectionObserver 的窄带更稳——章节很高时不会出现整段都不命中
    // 观察带、导致无高亮的空窗。
    function computeActive() {
      const els = ids
        .map((id) => ({ id, el: document.getElementById(id) }))
        .filter((x): x is { id: string; el: HTMLElement } => x.el !== null);
      if (els.length === 0) return;

      let current = els[0].id;
      for (const { id, el } of els) {
        if (el.getBoundingClientRect().top <= ACTIVATE_OFFSET) current = id;
        else break;
      }

      activeId = current;
      // 记住当前章节以便刷新恢复（存 sessionStorage，不污染 URL）。
      saveScrollSection(current);
    }

    // rAF 节流：滚动高频，合并到下一帧计算一次。
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        computeActive();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // 初始化：分享链接带 hash 时先预置高亮，避免异步内容就位前错位；
    // 否则按当前滚动位置算一次（恢复逻辑在 +page.svelte，这里只对齐高亮）。
    const hashId = decodeURIComponent(location.hash.slice(1));
    if (hashId && ids.includes(hashId)) activeId = hashId;
    else computeActive();

    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

{#if sections.length}
  <nav class="toc" aria-label={t('toc.title', lang)}>
    <ul>
      {#each sections as section (section.id)}
        <li>
          <a
            href="#{section.id}"
            class="toc-link"
            class:active={activeId === section.id}
            class:toc-link--sub={section.level === 2}
            onclick={(e) => {
              e.preventDefault();
              scrollTo(section.id);
            }}
          >
            {section.title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    position: sticky;
    top: 84px;
    width: 180px;
    flex-shrink: 0;
    align-self: flex-start;
    font-size: 13px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 1px solid var(--cd-color-border, #e5e7eb);
  }
  li {
    margin: 0;
  }
  .toc-link {
    display: block;
    padding: 4px 12px;
    color: var(--cd-color-text-1, #4e5969);
    text-decoration: none;
    line-height: 1.6;
    border-left: 2px solid transparent;
    margin-left: -1px;
    transition: color 0.15s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 子项（场景 demo）：缩进 + 略小字号，弱化层级 */
  .toc-link--sub {
    padding-left: 24px;
    font-size: 12px;
    color: var(--cd-color-text-2, #86909c);
  }
  .toc-link:hover {
    color: var(--cd-color-primary, #0064fa);
  }
  .toc-link.active {
    color: var(--cd-color-primary, #0064fa);
    border-left-color: var(--cd-color-primary, #0064fa);
    font-weight: 500;
  }
  @media (max-width: 1100px) {
    .toc {
      display: none;
    }
  }
</style>
