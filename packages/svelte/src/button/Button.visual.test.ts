// Button 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖 primary / secondary / danger 三种 type。
// 基线存于本目录 __screenshots__/，差异超阈值即失败。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import ButtonVisualFixture from './ButtonVisualFixture.svelte';

describe('Button 视觉回归', () => {
  it('primary / secondary / danger', async () => {
    const { baseElement } = renderVisualFixture(ButtonVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('button-default', {
      // headless 下抗锯齿/字体微差容忍：pixelmatch + 1% 错配比例阈值。
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
