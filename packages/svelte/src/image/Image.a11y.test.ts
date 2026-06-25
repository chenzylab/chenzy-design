// Image a11y：有意义图带 alt；装饰图（alt=''）取 role=presentation。
// jsdom 不真正解码图片，状态停在 loading/placeholder，<img> 与 alt/role 仍可断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Image from './Image.svelte';

// Image 的 src 为必填 prop，与 renderWithLocale 的宽松 AnyComponent 形态不严格兼容
// （exactOptionalPropertyTypes），故转为 helper 接受的构造器类型。
const ImageC = Image as unknown as Parameters<typeof renderWithLocale>[0];

describe('Image a11y', () => {
  it('有意义图：<img> 带 alt，无 axe violations', async () => {
    const { container } = renderWithLocale(ImageC, {
      props: { src: 'https://example.com/p.png', alt: 'A scenic mountain', lazy: false },
    });
    const img = container.querySelector('img.cd-image__img');
    expect(img?.getAttribute('alt')).toBe('A scenic mountain');
    expect(img?.getAttribute('role')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('装饰图（alt=""）：role=presentation，无 axe violations', async () => {
    const { container } = renderWithLocale(ImageC, {
      props: { src: 'https://example.com/deco.png', alt: '', lazy: false },
    });
    const img = container.querySelector('img.cd-image__img');
    expect(img?.getAttribute('role')).toBe('presentation');
    await expectNoAxeViolations(container);
  });
});
