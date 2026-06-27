// Avatar 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖圆形 + 方形。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import AvatarVisualFixture from './AvatarVisualFixture.svelte';

describe('Avatar 视觉回归', () => {
  it('circle / square', async () => {
    const { baseElement } = renderVisualFixture(AvatarVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('avatar-default', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
