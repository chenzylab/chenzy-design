// Anchor a11y：导航锚点列表。
//  - nav[aria-label] 包裹原生 <a> 链接列表；激活链接 aria-current（这里值为 'location'）。
//  - 嵌套 links.children 形成 ul/li 树。
// jsdom 只断言静态 ARIA + axe（scroll-spy / roving 键盘留给真实浏览器）。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Anchor from './Anchor.svelte';
import type { AnchorLink } from './types.js';

const links: AnchorLink[] = [
  { key: 'intro', href: '#intro', title: 'Intro' },
  { key: 'usage', href: '#usage', title: 'Usage' },
];

describe('Anchor a11y', () => {
  it('默认渲染：nav[aria-label] + 链接列表，无 axe violations', async () => {
    const { container } = renderWithLocale(Anchor, { props: { links } });
    const nav = container.querySelector('nav.cd-anchor');
    expect(nav).not.toBeNull();
    // ariaLabel 缺省走 locale，应为非空可访问名。
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelectorAll('a.cd-anchor__link')).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it('激活链接带 aria-current（首个默认激活）', async () => {
    const { container } = renderWithLocale(Anchor, {
      props: { links, defaultValue: 'usage' },
    });
    const current = container.querySelector('a[aria-current]');
    expect(current?.textContent?.trim()).toBe('Usage');
    await expectNoAxeViolations(container);
  });

  it('嵌套链接：渲染嵌套 ul/li 树，无 axe violations', async () => {
    const nested: AnchorLink[] = [
      {
        key: 'a',
        href: '#a',
        title: 'A',
        children: [{ key: 'a1', href: '#a1', title: 'A1' }],
      },
    ];
    const { container } = renderWithLocale(Anchor, { props: { links: nested } });
    // 顶层 ul 内含子 ul（嵌套树）。
    expect(container.querySelector('.cd-anchor__list .cd-anchor__list')).not.toBeNull();
    await expectNoAxeViolations(container);
  });
});

// scroll-spy 尺寸/可见性感知（对标 Semi）：window 模式下观测 documentElement，
// 尺寸变化（内容变高/section 从隐藏变可见但未滚动）触发一次 scroll-spy 重算。
// jsdom 无原生 RO，用可控桩断言 observe 了 documentElement，且 RO 回调不引发
// effect 循环（观测 documentElement，回调 setActive 只在 key 变化时写 state）。
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
    renderWithLocale(Anchor, { props: { links } });
    expect(MockRO.instances.length).toBeGreaterThanOrEqual(1);
    const ro = MockRO.instances[MockRO.instances.length - 1]!;
    expect(ro.observed).toContain(document.documentElement);
    // 手动 fire：应安全跑一次重算路径（rAF 节流内 setActive），不抛错。
    expect(() => ro.fire()).not.toThrow();
  });
});
