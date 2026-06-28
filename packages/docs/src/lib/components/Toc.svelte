<script lang="ts">
  import { locale } from '$lib/locale.svelte';
  import { t } from '$lib/i18n';

  const lang = $derived(locale.value);

  interface TocSection {
    id: string;
    title: string;
  }

  const { sections = [] }: { sections?: TocSection[] } = $props();

  let activeId = $state<string>('');

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 立即高亮，避免等待 observer 回调的延迟
      activeId = id;
    }
  }

  $effect(() => {
    // 依赖 sections，sections 变化时重建 observer
    const ids = sections.map((s) => s.id);
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // 记录每个 section 的可见情况，取最靠上的可见 section 为 active
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // 按 sections 顺序取第一个可见项
        const firstVisible = ids.find((id) => visible.has(id));
        if (firstVisible) activeId = firstVisible;
      },
      {
        // 顶部留出空间，使标题滚到接近视口顶部时即激活
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    );

    for (const el of elements) observer.observe(el);

    // 初始化 active：默认第一个
    if (!activeId) activeId = ids[0];

    return () => observer.disconnect();
  });
</script>

{#if sections.length}
  <nav class="toc" aria-label={t('toc.title', lang)}>
    <div class="toc-title">{t('toc.title', lang)}</div>
    <ul>
      {#each sections as section (section.id)}
        <li>
          <a
            href="#{section.id}"
            class="toc-link"
            class:active={activeId === section.id}
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
  .toc-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--cd-color-text-2, #86909c);
    margin-bottom: 12px;
    padding-left: 12px;
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
