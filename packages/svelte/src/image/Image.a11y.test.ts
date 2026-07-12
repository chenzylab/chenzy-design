// Image a11y：有意义图带 alt；装饰图（alt=''）axe 视为装饰图无违规。
// jsdom 不真正解码图片，状态停在 loading/placeholder，<img> 与 alt 仍可断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Image from './Image.svelte';

const ImageC = Image as unknown as Parameters<typeof renderWithLocale>[0];

describe('Image a11y', () => {
  it('有意义图：<img> 带 alt，无 axe violations', async () => {
    const { container } = renderWithLocale(ImageC, {
      props: { src: 'https://example.com/p.png', alt: 'A scenic mountain' },
    });
    const img = container.querySelector('img.cd-image-img');
    expect(img?.getAttribute('alt')).toBe('A scenic mountain');
    await expectNoAxeViolations(container);
  });

  it('装饰图（alt=""）：alt 为空串，无 axe violations', async () => {
    const { container } = renderWithLocale(ImageC, {
      props: { src: 'https://example.com/deco.png', alt: '' },
    });
    const img = container.querySelector('img.cd-image-img');
    expect(img?.getAttribute('alt')).toBe('');
    await expectNoAxeViolations(container);
  });
});
