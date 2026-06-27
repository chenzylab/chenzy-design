// Switch 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖开（value=true）/ 关（value=false）两态。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import SwitchVisualFixture from './SwitchVisualFixture.svelte';

describe('Switch 视觉回归', () => {
  it('on / off', async () => {
    const { baseElement } = renderVisualFixture(SwitchVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('switch-default', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
