// Carousel 键盘 e2e（browser project / 真实 chromium），viewport 方向键切换 slide。
// viewport（role=group, aria-roledescription=slides）count>perView 时 tabindex=0 可真实聚焦，
// ←/→ 切换 active slide、Home/End 跳首末（loop=false 故有界）。非 active slide 设 inert。
//   1. viewport 真实聚焦后 → 前进、← 后退（active slide data-slide 变化）。
//   2. End 跳末张、Home 跳首张。
//   3. 非 active slide 标记 inert（焦点/交互隔离）。
import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { renderKbdFixture, userEvent } from '../test-utils/kbd.js';
import CarouselKbdFixture from './CarouselKbdFixture.svelte';

function loc(el: Element) {
  return page.elementLocator(el);
}

// 当前 active slide：slide 模式 perView=1 下唯一非 inert 的 slide，取其 data-slide。
function activeSlide(viewport: HTMLElement): string | null {
  const slides = Array.from(
    viewport.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]'),
  );
  const active = slides.find((s) => !s.hasAttribute('inert'));
  return active?.querySelector('[data-slide]')?.getAttribute('data-slide') ?? null;
}

describe('Carousel 键盘 e2e（viewport 方向键切 slide）', () => {
  it('viewport 聚焦 + ←/→ 切换 + Home/End 首末 + 非 active 项 inert', async () => {
    const { baseElement } = renderKbdFixture(CarouselKbdFixture);

    const viewport = baseElement.querySelector(
      '[aria-roledescription="slides"]',
    ) as HTMLElement;
    expect(viewport).not.toBeNull();
    expect(viewport.tabIndex).toBe(0);

    // 初始 active slide 为第 0 张。
    expect(activeSlide(viewport)).toBe('0');

    // 3. 非 active slide（1、2）应 inert。
    const slides = Array.from(
      viewport.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]'),
    );
    expect(slides.length).toBe(3);
    expect(slides.filter((s) => s.hasAttribute('inert')).length).toBe(2);

    // viewport 真实聚焦。
    viewport.focus();
    await expect.element(loc(viewport)).toHaveFocus();

    // 1. → 前进到第 1 张；再 → 到第 2 张。
    await userEvent.keyboard('{ArrowRight}');
    expect(activeSlide(viewport)).toBe('1');
    await userEvent.keyboard('{ArrowRight}');
    expect(activeSlide(viewport)).toBe('2');
    // ← 后退回第 1 张。
    await userEvent.keyboard('{ArrowLeft}');
    expect(activeSlide(viewport)).toBe('1');

    // 2. Home 跳首张、End 跳末张。
    await userEvent.keyboard('{Home}');
    expect(activeSlide(viewport)).toBe('0');
    await userEvent.keyboard('{End}');
    expect(activeSlide(viewport)).toBe('2');

    // 焦点始终在 viewport 上（方向键不偷焦点）。
    await expect.element(loc(viewport)).toHaveFocus();
  });
});
