// Anchor a11y：导航锚点列表（组合式 children + <Anchor.Link>，对齐 Semi）。
//  - nav[role=navigation][aria-label] 包裹链接列表；链接 role=link；激活链接 aria-current=location。
//  - 嵌套 <Anchor.Link> 形成嵌套 role=list 树。
// jsdom 只断言静态 ARIA + axe（scroll-spy / roving 键盘留给真实浏览器）。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import AnchorBasicFixture from './AnchorBasicFixture.svelte';
import AnchorNestedFixture from './AnchorNestedFixture.svelte';
import AnchorDeclarativeFixture from './AnchorDeclarativeFixture.svelte';

// 挂载后 queueMicrotask 异步 bump 一次 → $derived.by 重建 declared；等待一帧。
async function flushBump(): Promise<void> {
  await new Promise((r) => queueMicrotask(() => r(null)));
  await new Promise((r) => setTimeout(r, 0));
}

describe('Anchor a11y', () => {
  it('默认渲染：nav[aria-label] + 链接列表，无 axe violations', async () => {
    const { container } = render(AnchorBasicFixture);
    await flushBump();
    const nav = container.querySelector('nav.cd-anchor');
    expect(nav).not.toBeNull();
    // aria-label 缺省走 locale，应为非空可访问名。
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelectorAll('.cd-anchor-link-title')).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it('激活链接带 aria-current（defaultAnchor 高亮）', async () => {
    const { container } = render(AnchorBasicFixture, {
      props: { defaultAnchor: '#usage' },
    });
    await flushBump();
    const current = container.querySelector('[aria-current]');
    expect(current?.textContent?.trim()).toBe('Usage');
    await expectNoAxeViolations(container);
  });

  it('嵌套链接：渲染嵌套 role=list 树，无 axe violations', async () => {
    const { container } = render(AnchorNestedFixture);
    await flushBump();
    // 顶层链接内含子 role=list（嵌套树）。
    expect(
      container.querySelector('.cd-anchor-link [role="list"]'),
    ).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});

// 组合式 <Anchor.Link>：子组件按 DOM 顺序 + 嵌套层级注册渲染，
// disabled 链接排除 roving（tabindex=-1 + aria-disabled），且不触发 Svelte5 自循环
// （effect_update_depth_exceeded；照 Nav「普通数组 declared + revision + queueMicrotask」解法）。
describe('Anchor 组合式 <Anchor.Link>', () => {
  it('子组件注册渲染（含嵌套 + disabled），无 axe violations', async () => {
    const { container } = render(AnchorDeclarativeFixture);
    await flushBump();

    const links = Array.from(
      container.querySelectorAll<HTMLElement>('.cd-anchor-link-title'),
    );
    // 5 个链接：Guide / Install / Usage / API / FAQ。
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'Guide',
      'Install',
      'Usage',
      'API',
      'FAQ',
    ]);
    // 嵌套树：某链接内含子 role=list（Guide 的 children）。
    expect(
      container.querySelector('.cd-anchor-link [role="list"]'),
    ).not.toBeNull();

    // disabled 链接：aria-disabled=true 且 tabindex=-1（排除 roving）。
    const faq = links.find((a) => a.textContent?.trim() === 'FAQ')!;
    expect(faq.getAttribute('aria-disabled')).toBe('true');
    expect(faq.tabIndex).toBe(-1);
    // 首个可聚焦链接（Guide）为单一 Tab 停靠点（tabindex=0）。
    const guide = links.find((a) => a.textContent?.trim() === 'Guide')!;
    expect(guide.tabIndex).toBe(0);

    await expectNoAxeViolations(container);
  });
});

// scroll-spy 尺寸/可见性感知（对标 Semi）：window 模式下观测 documentElement，
// 尺寸变化（内容变高/section 从隐藏变可见但未滚动）触发一次 scroll-spy 重算。
// jsdom 无原生 RO，用可控桩断言 observe 了 documentElement，且 RO 回调不引发
// effect 循环（观测 documentElement，回调 setActive 只在 href 变化时写 state）。
describe('Anchor scroll-spy 尺寸感知（ResizeObserver）', () => {
  class MockRO {
    static instances: MockRO[] = [];
    cb: ResizeObserverCallback;
    observed: Element[] = [];
    disconnected = false;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
      MockRO.instances.push(this);
    }
    observe(el: Element): void {
      this.observed.push(el);
    }
    unobserve(): void {}
    disconnect(): void {
      this.disconnected = true;
    }
    fire(): void {
      this.cb(
        [
          {
            target: document.documentElement,
            contentBoxSize: [{ inlineSize: 100, blockSize: 500 }],
            contentRect: { width: 100, height: 500 },
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    MockRO.instances = [];
  });

  it('window 模式观测 documentElement，RO 回调不抛错（无 effect 循环）', () => {
    MockRO.instances = [];
    vi.stubGlobal('ResizeObserver', MockRO);
    render(AnchorBasicFixture);
    expect(MockRO.instances.length).toBeGreaterThanOrEqual(1);
    const ro = MockRO.instances[MockRO.instances.length - 1]!;
    expect(ro.observed).toContain(document.documentElement);
    // 手动 fire：应安全跑一次重算路径（rAF 节流内 setActive），不抛错。
    expect(() => ro.fire()).not.toThrow();
  });
});
