// VideoProgress 拖拽 activeIndex/hover 行为 e2e（browser project / 真实 chromium）。
//
// 对齐 Semi progressFoundation.ts：
//  1. 拖拽中（mousedown 起）按当前 value 落在哪段自动高亮该段（setActiveIndex），
//     即使鼠标没有 hover 在该段矩形上——本次改动前本库 activeIndex 完全由 hover 驱动，无此行为。
//  2. hover 某段时，仅当"当前播放值"（非鼠标位置）落在该段区间才置 isHandleHovering
//     （handleSliderMouseEnter/Leave 用 currentValue 判断，不是无条件 hover=true）。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import VideoProgressKbdFixture from './VideoProgressKbdFixture.svelte';

describe('VideoProgress 拖拽/hover', () => {
  it('拖拽经过某 marker 段时该段自动加 active class（对齐 Semi setActiveIndex）', async () => {
    renderKbdFixture(VideoProgressKbdFixture);

    const slider = document.querySelector('.cd-videoPlayer-progress') as HTMLElement;
    const segments = slider.querySelectorAll('.cd-videoPlayer-progress-slider');
    expect(segments).toHaveLength(3); // 0-20 / 20-40 / 40-60

    const r = slider.getBoundingClientRect();
    const y = r.top + r.height / 2;
    // 第三段（40-60s）对应 x ≈ r.left + r.width * (50/60)
    const xThirdSegment = r.left + r.width * (50 / 60);

    slider.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        clientX: xThirdSegment,
        clientY: y,
        button: 0,
      }),
    );

    await expect
      .poll(() => segments[2]!.classList.contains('cd-videoPlayer-progress-slider-active'))
      .toBe(true);
    // 未命中段不应被点亮。
    expect(segments[0]!.classList.contains('cd-videoPlayer-progress-slider-active')).toBe(false);
    expect(segments[1]!.classList.contains('cd-videoPlayer-progress-slider-active')).toBe(false);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  it('hover 某段：仅当前播放值落在该段区间才让 handle 变可见', async () => {
    // fixture 初始 value=15（落在第一段 0-20 内）。
    renderKbdFixture(VideoProgressKbdFixture);

    const slider = document.querySelector('.cd-videoPlayer-progress') as HTMLElement;
    const segments = slider.querySelectorAll('.cd-videoPlayer-progress-slider');
    const handle = slider.querySelector('.cd-videoPlayer-progress-handle') as HTMLElement;

    // hover 第一段（含 value=15）→ handle 应可见（opacity:1）。
    segments[0]!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await expect.poll(() => getComputedStyle(handle).opacity).toBe('1');
    segments[0]!.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await expect.poll(() => getComputedStyle(handle).opacity).toBe('0');

    // hover 第三段（不含 value=15）→ handle 不应可见。
    segments[2]!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await expect.poll(() => getComputedStyle(handle).opacity).toBe('0');
  });
});
