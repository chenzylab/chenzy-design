// Empty a11y：预设插画 aria-hidden；外部图片 <img> 带 alt。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Empty from './Empty.svelte';

describe('Empty a11y', () => {
  it('预设插画：image 容器 aria-hidden，无 axe violations', async () => {
    const { container } = renderWithLocale(Empty, {
      props: { image: 'noData', description: 'No data available' },
    });
    const imageBox = container.querySelector('.cd-empty__image');
    expect(imageBox?.getAttribute('aria-hidden')).toBe('true');
    await expectNoAxeViolations(container);
  });

  it('外部图片 URL：<img> 带 alt（取标题/空串），无 axe violations', async () => {
    const { container } = renderWithLocale(Empty, {
      props: { image: 'https://example.com/empty.png', title: 'Nothing here' },
    });
    const img = container.querySelector('.cd-empty__img');
    expect(img?.getAttribute('alt')).toBe('Nothing here');
    await expectNoAxeViolations(container);
  });
});
