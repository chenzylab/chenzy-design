// Empty a11y：SVG 精灵插画 aria-hidden；外部图片 <img> 带 alt（取 description，缺省 "empty"）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Empty from './Empty.svelte';

describe('Empty a11y', () => {
  it('SVG 精灵插画：svg aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(Empty, {
      props: {
        image: { id: 'illust-no-data', viewBox: '0 0 200 200' },
        title: '暂无数据',
        description: 'No data available',
      },
    });
    const svg = container.querySelector('.cd-empty-image svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('外部图片 URL：<img> alt 取 description，无 axe violations', async () => {
    const { container } = renderWithLocale(Empty, {
      props: { image: 'https://example.com/empty.png', description: 'Nothing here' },
    });
    const img = container.querySelector('.cd-empty-image img');
    expect(img?.getAttribute('alt')).toBe('Nothing here');
    await expectNoAxeViolations(container);
  });

  it('无 description 的外部图片：alt 回退为 "empty"', async () => {
    const { container } = renderWithLocale(Empty, {
      props: { image: 'https://example.com/empty.png' },
    });
    const img = container.querySelector('.cd-empty-image img');
    expect(img?.getAttribute('alt')).toBe('empty');
    await expectNoAxeViolations(container);
  });
});
