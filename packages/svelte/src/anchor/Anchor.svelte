<!--
  Anchor — see specs/components/navigation/Anchor.spec.md
  基础子集: vertical 链接列表、scroll-spy 激活高亮、点击平滑滚动、ink 滑块。
  受控/非受控 (红线 #1: 不回写 value, 仅 onChange)。
  scroll-spy (红线 #3): $effect 内命令式 addEventListener('scroll')，rAF 节流，
  在事件回调里读 getBoundingClientRect (非 render 期)，cleanup 移除监听 + 取消 rAF。
  ink 用激活链接的 CSS 左边框 (border-inline-start)，不 JS 测 DOM 定位。
  affix: position:sticky 吸顶（inset-block-start = offsetTop）。
  updateHash: 激活变更时写 location.hash（replaceState，不触发额外滚动/历史堆栈）。
  targetOffset: 点击滚动的独立偏移，缺省继承 offsetTop。
  TODO(延后): horizontal、getContainer 自定义容器、多级嵌套。
-->
<script lang="ts">
  import type { AnchorLink } from './types.js';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    links?: AnchorLink[];
    value?: string;
    defaultValue?: string;
    offsetTop?: number;
    bounds?: number;
    showInk?: boolean;
    scrollMotion?: boolean;
    /** position:sticky 吸顶 */
    affix?: boolean;
    /** 激活变更时写 location.hash */
    updateHash?: boolean;
    /** 点击滚动的独立偏移（缺省继承 offsetTop） */
    targetOffset?: number;
    onChange?: (key: string) => void;
    ariaLabel?: string;
  }

  let {
    links = [],
    value,
    defaultValue,
    offsetTop = 0,
    bounds = 5,
    showInk = true,
    scrollMotion = true,
    affix = false,
    updateHash = false,
    targetOffset,
    onChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  function getInitialActive(): string {
    return defaultValue ?? links[0]?.key ?? '';
  }

  // --- 受控 value (红线 #1): 不回写 value, 仅 onChange ---
  const isControlled = $derived(value !== undefined);
  let innerActive = $state<string>(getInitialActive());
  const activeKey = $derived<string>(isControlled ? (value ?? '') : innerActive);

  function setActive(key: string) {
    if (key === activeKey) return;
    if (!isControlled) innerActive = key;
    onChange?.(key);
  }

  // updateHash：把激活链接的 href（#id）写入 location.hash。
  // 用 replaceState 避免污染历史堆栈与触发浏览器原生跳转滚动。
  function writeHash(href: string) {
    if (!updateHash || typeof window === 'undefined') return;
    if (!href.startsWith('#')) return;
    history.replaceState(null, '', href);
  }

  // 命令式读取目标元素并算出当前激活 key（在事件回调里调用，非 render 期）。
  function computeActiveKey(): string {
    let best = '';
    let bestTop = -Infinity;
    for (const link of links) {
      const el = document.querySelector(link.href);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      // 已滚过顶部阈值的 section 里取最接近阈值的那个。
      if (top <= offsetTop + bounds && top > bestTop) {
        bestTop = top;
        best = link.key;
      }
    }
    // 没有任何 section 越过阈值时，回退到第一个链接。
    if (best === '') best = links[0]?.key ?? '';
    return best;
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // --- scroll-spy (红线 #3): $effect 内命令式监听 + rAF 节流 ---
  $effect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(computeActiveKey());
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // 初始算一次。
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  function handleClick(e: MouseEvent, link: AnchorLink) {
    e.preventDefault();
    const el = document.querySelector(link.href);
    if (el) {
      const smooth = scrollMotion && !prefersReducedMotion();
      const offset = targetOffset ?? offsetTop;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    }
    setActive(link.key);
    writeHash(link.href);
  }
</script>

<nav
  class="cd-anchor"
  class:cd-anchor--no-ink={!showInk}
  class:cd-anchor--affix={affix}
  style={affix ? `inset-block-start:${offsetTop}px` : undefined}
  aria-label={ariaLabel ?? loc().t('Anchor.ariaLabel')}
>
  <ul class="cd-anchor__list">
    {#each links as link (link.key)}
      {@const active = link.key === activeKey}
      <li class="cd-anchor__item">
        <a
          class="cd-anchor__link"
          class:cd-anchor__link--active={active}
          href={link.href}
          aria-current={active ? 'true' : undefined}
          onclick={(e) => handleClick(e, link)}
        >
          {link.title}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .cd-anchor {
    display: block;
  }
  .cd-anchor--affix {
    position: sticky;
    inset-block-start: 0;
  }
  .cd-anchor__list {
    margin: 0;
    padding: 0;
    list-style: none;
    border-inline-start: 1px solid var(--cd-anchor-rail-color);
  }
  .cd-anchor__item {
    margin: 0;
    padding: 0;
  }
  .cd-anchor__link {
    display: block;
    padding: var(--cd-anchor-link-padding);
    border-inline-start: var(--cd-anchor-ink-width) solid transparent;
    margin-inline-start: calc(-1 * var(--cd-anchor-ink-width));
    color: var(--cd-anchor-link-color);
    text-decoration: none;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: color var(--cd-motion-duration-fast)
      var(--cd-motion-ease-standard);
  }
  .cd-anchor__link:hover {
    color: var(--cd-anchor-link-color-active);
  }
  .cd-anchor__link:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-anchor__link--active {
    color: var(--cd-anchor-link-color-active);
    border-inline-start-color: var(--cd-anchor-ink-color);
  }
  .cd-anchor--no-ink .cd-anchor__link--active {
    border-inline-start-color: transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-anchor__link {
      transition: none;
    }
  }
</style>
