// Input 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖默认 + disabled 两态。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import InputVisualFixture from './InputVisualFixture.svelte';

describe('Input 视觉回归', () => {
  it('default / disabled', async () => {
    const { baseElement } = renderVisualFixture(InputVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('input-default', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
