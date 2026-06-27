// Tag 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖 light / solid / ghost 三种 type。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import TagVisualFixture from './TagVisualFixture.svelte';

describe('Tag 视觉回归', () => {
  it('light / solid / ghost', async () => {
    const { baseElement } = renderVisualFixture(TagVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    await expect.element(locate(root)).toMatchScreenshot('tag-default', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
