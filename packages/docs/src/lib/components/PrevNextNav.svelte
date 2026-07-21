<script lang="ts">
  import { base } from '$app/paths';
  import { IconChevronLeft, IconChevronRight } from '@chenzy-design/icons';
  import SidebarIcon from './SidebarIcon.svelte';
  import { locale } from '$lib/locale.svelte';
  import { getPrevNext, type OrderedComponent } from '$lib/component-order';

  // name：当前组件 lowercase 名。据此在有序组件列表中取前后邻居（对齐 Semi PrevAndNext）。
  const { name }: { name: string } = $props();

  const lang = $derived(locale.value);
  const nav = $derived(getPrevNext(name));

  // 组件名跟随语言（对齐 Semi nav-path/nav-name 用当前语言 title）：中文取中文名、英文取驼峰名。
  const label = (c: OrderedComponent) => (lang === 'zh' ? c.zhName : c.displayName);
</script>

<!-- 页脚「上一个 / 下一个」组件导航（对齐 Semi PrevAndNext）：
     左卡片 = 箭头在左、文字右对齐、组件图标在右；右卡片 = 图标在左、文字左对齐、箭头在右。 -->
<nav class="prev-next-nav" aria-label="组件导航">
  {#if nav.prev}
    <a class="nav-item" href="{base}/components/{nav.prev.name}">
      <span class="direction-icon"><IconChevronLeft size="large" /></span>
      <span class="nav-detail">
        <span class="nav-text align-right">
          <span class="nav-path">{nav.prev.category} / {label(nav.prev)}</span>
          <span class="nav-name">{label(nav.prev)}</span>
        </span>
        <span class="nav-icon">
          <SidebarIcon name={nav.prev.name} displayName={nav.prev.displayName} category={nav.prev.category} size={40} />
        </span>
      </span>
    </a>
  {:else}
    <span></span>
  {/if}

  {#if nav.next}
    <a class="nav-item" href="{base}/components/{nav.next.name}">
      <span class="nav-detail">
        <span class="nav-icon">
          <SidebarIcon name={nav.next.name} displayName={nav.next.displayName} category={nav.next.category} size={40} />
        </span>
        <span class="nav-text align-left">
          <span class="nav-path">{nav.next.category} / {label(nav.next)}</span>
          <span class="nav-name">{label(nav.next)}</span>
        </span>
      </span>
      <span class="direction-icon"><IconChevronRight size="large" /></span>
    </a>
  {:else}
    <span></span>
  {/if}
</nav>

<style>
  /* 对齐 Semi PrevAndNext/index.scss：两卡片 space-between，卡片高 73px，圆角 6px。 */
  .prev-next-nav {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin: 50px 0;
  }
  .nav-item {
    flex: 1 1 45%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 73px;
    background: var(--cd-color-bg-0, #fff);
    border: 1px solid var(--cd-color-border, #e5e7eb);
    border-radius: 6px;
    box-sizing: border-box;
    padding: 0 23px;
    text-decoration: none;
    transition: background-color 0.15s;
  }
  .nav-item:hover {
    background-color: var(--cd-color-fill-0, #f7f8fa);
  }
  .nav-item:active {
    background-color: var(--cd-color-fill-1, #f2f3f5);
  }
  .direction-icon {
    flex: 0 0 auto;
    display: inline-flex;
    color: var(--cd-color-text-2, #86909c);
    font-size: 20px;
  }
  .nav-detail {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .nav-text {
    display: flex;
    flex-direction: column;
    margin: 0 26px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
  }
  .nav-text.align-right {
    text-align: right;
    align-items: flex-end;
  }
  .nav-text.align-left {
    text-align: left;
    align-items: flex-start;
  }
  .nav-path {
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: 0.02em;
    color: var(--cd-color-text-2, #86909c);
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .nav-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--cd-color-text-0, #1f2329);
    line-height: 1.25;
    margin-top: 5px;
  }
  /* 组件图标：Semi nav-icon font-size:40px → 图标约 40px 见方。 */
  .nav-icon {
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 40px;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
  }
  @media (max-width: 820px) {
    .prev-next-nav {
      flex-direction: column;
    }
  }
</style>
