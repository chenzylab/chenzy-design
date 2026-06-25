// Carousel a11y：走马灯（APG carousel）。
// 根 role=region + aria-roledescription=carousel + aria-label；
// 视口 role=group aria-roledescription=slides；每张 role=group aria-roledescription=slide + aria-label；
// autoplay 提供可见播放/暂停按钮（WCAG 2.2.2，aria-pressed）；箭头/指示器按钮带 aria-label。
// 用真实 slides Snippet[] 夹具（CarouselA11yFixture）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CarouselFixture from './CarouselA11yFixture.svelte';

describe('Carousel a11y', () => {
  it('默认渲染：root role=region + 视口/slide group 语义，无 axe violations', async () => {
    const { container } = renderWithLocale(CarouselFixture, {});

    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-roledescription')).toBe('carousel');
    // 无显式 ariaLabel 时来自 i18n（验证 LocaleProvider 管线）。
    expect(region?.getAttribute('aria-label')).toBeTruthy();

    const viewport = container.querySelector('.cd-carousel__viewport');
    expect(viewport?.getAttribute('role')).toBe('group');
    expect(viewport?.getAttribute('aria-roledescription')).toBe('slides');

    const slides = container.querySelectorAll('.cd-carousel__slide');
    expect(slides.length).toBe(3);
    expect(slides[0]?.getAttribute('aria-roledescription')).toBe('slide');
    expect(slides[0]?.getAttribute('aria-label')).toBeTruthy();

    // 非当前窗口的 slide 移出可达性树（aria-hidden + inert）。
    expect(slides[1]?.getAttribute('aria-hidden')).toBe('true');

    // 箭头按钮带 aria-label（来自 i18n）。
    const prev = container.querySelector('.cd-carousel__arrow--prev');
    expect(prev?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(container);
  });

  it('autoplay：可见播放/暂停按钮 aria-pressed（WCAG 2.2.2），无 axe violations', async () => {
    const { container } = renderWithLocale(CarouselFixture, {
      props: { autoplay: true, ariaLabel: 'Featured products' },
    });
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute('aria-label')).toBe('Featured products');

    const playBtn = container.querySelector('.cd-carousel__play');
    expect(playBtn).not.toBeNull();
    expect(playBtn?.getAttribute('aria-pressed')).toBeTruthy();
    expect(playBtn?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(container);
  });
});
