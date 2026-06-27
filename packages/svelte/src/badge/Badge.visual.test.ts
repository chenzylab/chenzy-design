// Badge 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖带数字角标（count=5 / count=128 溢出）。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import BadgeVisualFixture from './BadgeVisualFixture.svelte';

describe('Badge 视觉回归', () => {
  it('count badge', async () => {
    const { baseElement } = renderVisualFixture(BadgeVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('badge-default', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
