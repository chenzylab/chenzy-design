// Anchor a11y：导航锚点列表。
//  - nav[aria-label] 包裹原生 <a> 链接列表；激活链接 aria-current（这里值为 'location'）。
//  - 嵌套 links.children 形成 ul/li 树。
// jsdom 只断言静态 ARIA + axe（scroll-spy / roving 键盘留给真实浏览器）。
import { describe, it, expect } from 'vitest';
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
