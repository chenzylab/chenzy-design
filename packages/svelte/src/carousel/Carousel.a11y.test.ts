// Carousel a11y：走马灯（APG carousel）。
// 根 role=region + aria-roledescription=carousel + aria-label（i18n）+ tabindex 承接键盘导航；
// 每张 role=group aria-roledescription=slide + aria-label；非当前张 aria-hidden + inert；
// autoPlay 提供可见播放/暂停按钮（WCAG 2.2.2，aria-pressed）；箭头/指示器带 aria-label。
// 用真实 slides Snippet[] 夹具（CarouselA11yFixture）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import CarouselFixture from './CarouselA11yFixture.svelte';

describe('Carousel a11y', () => {
  it('默认渲染：root role=region + slide group 语义，无 axe violations', async () => {
    const { container } = renderWithLocale(CarouselFixture, {});

    const region = container.querySelector('[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-roledescription')).toBe('carousel');
    // aria-label 来自 i18n（验证 LocaleProvider 管线）。
    expect(region?.getAttribute('aria-label')).toBeTruthy();
    // 多张时 root 可聚焦承接键盘导航。
    expect(region?.getAttribute('tabindex')).toBe('0');

    const slides = container.querySelectorAll('.cd-carousel-content-item');
    expect(slides.length).toBe(3);
    expect(slides[0]?.getAttribute('role')).toBe('group');
    expect(slides[0]?.getAttribute('aria-roledescription')).toBe('slide');
    expect(slides[0]?.getAttribute('aria-label')).toBeTruthy();

    // 非当前 slide 移出可达性树（aria-hidden + inert）。
    expect(slides[1]?.getAttribute('aria-hidden')).toBe('true');

    // 箭头带 aria-label（来自 i18n）。
    const prev = container.querySelector('.cd-carousel-arrow-prev');
    expect(prev?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(container);
  });

  it('autoPlay：可见播放/暂停按钮 aria-pressed（WCAG 2.2.2），无 axe violations', async () => {
    const { container } = renderWithLocale(CarouselFixture, {
      props: { autoPlay: true },
    });
    const region = container.querySelector('[role="region"]');
    expect(region?.getAttribute('aria-label')).toBeTruthy();

    const playBtn = container.querySelector('.cd-carousel-play');
    expect(playBtn).not.toBeNull();
    expect(playBtn?.getAttribute('aria-pressed')).toBeTruthy();
    expect(playBtn?.getAttribute('aria-label')).toBeTruthy();

    await expectNoAxeViolations(container);
  });
});
