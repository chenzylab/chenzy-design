// SplitButtonGroup 视觉回归（visual project / 真实 chromium + toMatchScreenshot）。
// 一张图覆盖 solid / light / borderless 三组分裂按钮，锁住对齐 Semi 的关键视觉：
// 主按钮与箭头 1px 细缝 + 首尾圆角。基线存于本目录 __screenshots__/。
import { describe, it, expect } from 'vitest';
import { renderVisualFixture, locate } from '../test-utils/visual.js';
import SplitButtonGroupVisualFixture from './SplitButtonGroupVisualFixture.svelte';

describe('SplitButtonGroup 视觉回归', () => {
  it('solid / light / borderless', async () => {
    const { baseElement } = renderVisualFixture(SplitButtonGroupVisualFixture);
    const root = baseElement.querySelector('[data-visual-root]') as HTMLElement;
    // 等 use:splitClasses 的 MutationObserver 给首/末按钮打上圆角 class。
    await new Promise((r) => setTimeout(r, 100));
    await expect.element(locate(root)).toMatchScreenshot('split-button-group', {
      comparatorName: 'pixelmatch',
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 },
    });
  });
});
