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
  getContainer: 自定义滚动容器（缺省 window）。提供时监听该容器 scroll，
    几何按容器视口换算（target.top - container.top），点击滚动该容器（红线 #3）。
  horizontal: 水平模式，链接横排，ink 走底部下划线（border-block-end）。
  多级嵌套: link.children 形成树形。渲染用递归 snippet（renderList），每深一层
    的子列表向内缩进一级（--cd-anchor-indent，逐层累加），rail 只在顶层一条。
    scroll-spy 命令式遍历扁平化树（flatten 纯函数派生 flatLinks），父子链接皆可
    点击跳转 + 滚动高亮。无 children 时行为与平铺链接完全一致（向后兼容）。
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
    /** 自定义滚动容器；缺省监听/滚动 window */
    getContainer?: () => HTMLElement | null;
    /** 水平模式：链接横排，ink 走底部下划线 */
    horizontal?: boolean;
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
    getContainer,
    horizontal = false,
    onChange,
    ariaLabel,
  }: Props = $props();

  const loc = useLocale();

  // 深度优先扁平化嵌套链接树（纯函数，红线 #2）。scroll-spy 与初始激活
  // 计算只关心全部叶/枝链接的线性集合，与渲染的树形结构解耦。
  function flatten(items: AnchorLink[]): AnchorLink[] {
    const out: AnchorLink[] = [];
    for (const item of items) {
      out.push(item);
      if (item.children?.length) out.push(...flatten(item.children));
    }
    return out;
  }
  const flatLinks = $derived<AnchorLink[]>(flatten(links));

  function getInitialActive(): string {
    return defaultValue ?? flatten(links)[0]?.key ?? '';
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

  // getContainer 提供时几何以容器视口为参照系（target.top - container.top），
  // 缺省时参照系为浏览器视口顶部（0），即原 window 行为。命令式读取，非 render 期。
  function getReferenceTop(): number {
    const container = getContainer?.();
    return container ? container.getBoundingClientRect().top : 0;
  }

  // 命令式读取目标元素并算出当前激活 key（在事件回调里调用，非 render 期）。
  function computeActiveKey(): string {
    const refTop = getReferenceTop();
    let best = '';
    let bestTop = -Infinity;
    // 遍历扁平化后的全部链接（含嵌套子链接），父子皆参与 scroll-spy。
    for (const link of flatLinks) {
      const el = document.querySelector(link.href);
      if (!el) continue;
      // 相对滚动容器视口顶部的偏移。
      const top = el.getBoundingClientRect().top - refTop;
      // 已滚过顶部阈值的 section 里取最接近阈值的那个。
      if (top <= offsetTop + bounds && top > bestTop) {
        bestTop = top;
        best = link.key;
      }
    }
    // 没有任何 section 越过阈值时，回退到第一个链接。
    if (best === '') best = flatLinks[0]?.key ?? '';
    return best;
  }

  function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // --- scroll-spy (红线 #3): $effect 内命令式监听 + rAF 节流 ---
  // 监听目标：getContainer() 返回的元素（缺省 window）。读取 getContainer 使其
  // 变更时 effect 重订阅。
  $effect(() => {
    if (typeof window === 'undefined') return;
    const target: HTMLElement | Window = getContainer?.() ?? window;
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(computeActiveKey());
      });
    }

    target.addEventListener('scroll', onScroll, { passive: true });
    // 初始算一次。
    onScroll();

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  function handleClick(e: MouseEvent, link: AnchorLink) {
    e.preventDefault();
    const el = document.querySelector(link.href);
    if (el) {
      const smooth = scrollMotion && !prefersReducedMotion();
      const offset = targetOffset ?? offsetTop;
      const container = getContainer?.();
      if (container) {
        // 滚动量 = 目标相对容器视口顶部的偏移 - offset，叠加容器当前滚动位置。
        const delta =
          el.getBoundingClientRect().top -
          container.getBoundingClientRect().top -
          offset;
        container.scrollTo({
          top: container.scrollTop + delta,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
      }
    }
    setActive(link.key);
    writeHash(link.href);
  }
</script>

<nav
  class="cd-anchor"
  class:cd-anchor--no-ink={!showInk}
  class:cd-anchor--affix={affix}
  class:cd-anchor--horizontal={horizontal}
  style={affix ? `inset-block-start:${offsetTop}px` : undefined}
  aria-label={ariaLabel ?? loc().t('Anchor.ariaLabel')}
>
  {@render renderList(links, 0)}
</nav>

{#snippet renderList(items: AnchorLink[], level: number)}
  <ul class="cd-anchor__list">
    {#each items as link (link.key)}
      {@const active = link.key === activeKey}
      <li class="cd-anchor__item">
        <a
          class="cd-anchor__link cd-anchor__link--level-{level}"
          class:cd-anchor__link--active={active}
          href={link.href}
          aria-current={active ? 'true' : undefined}
          onclick={(e) => handleClick(e, link)}
        >
          {link.title}
        </a>
        {#if link.children?.length}
          {@render renderList(link.children, level + 1)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

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
  /* 嵌套子列表：不重复绘制滑轨（rail 只在顶层一条），整体向内缩进一级，
     使每深一层的链接累加缩进。level-0 顶层链接样式完全不受影响（向后兼容）。 */
  .cd-anchor__list .cd-anchor__list {
    border-inline-start: none;
    margin-inline-start: var(--cd-anchor-indent, 16px);
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

  /* --- horizontal 水平模式：链接横排，ink 走底部下划线 --- */
  .cd-anchor--horizontal .cd-anchor__list {
    display: flex;
    flex-wrap: nowrap;
    border-inline-start: none;
    border-block-end: 1px solid var(--cd-anchor-rail-color);
  }
  .cd-anchor--horizontal .cd-anchor__link {
    border-inline-start: none;
    margin-inline-start: 0;
    border-block-end: var(--cd-anchor-ink-width) solid transparent;
    margin-block-end: calc(-1 * var(--cd-anchor-ink-width));
  }
  .cd-anchor--horizontal .cd-anchor__link--active {
    border-inline-start-color: transparent;
    border-block-end-color: var(--cd-anchor-ink-color);
  }
  .cd-anchor--horizontal.cd-anchor--no-ink .cd-anchor__link--active {
    border-block-end-color: transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-anchor__link {
      transition: none;
    }
  }
</style>
