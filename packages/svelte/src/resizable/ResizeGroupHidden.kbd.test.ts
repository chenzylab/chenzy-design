// ResizeGroup 初挂载于 display:none 容器时的尺寸重算回归测试（browser project / 真实 chromium）。
//
// 对齐 Semi #3336：容器初挂载不可见时 offsetWidth/offsetHeight 恒为 0，
// initSpace() 提前 return，itemPercent 从未被填充；容器变可见后若不重算，
// 面板会一直保持塌陷宽度（或未分配 flex-basis 导致的默认布局）。
import { describe, it, expect } from 'vitest';
import { renderKbdFixture } from '../test-utils/kbd.js';
import ResizeGroupHiddenFixture from './ResizeGroupHiddenFixture.svelte';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('ResizeGroup display:none 挂载后变可见', () => {
  it('容器从隐藏变为可见后应重新计算面板尺寸（非塌陷宽度）', async () => {
    renderKbdFixture(ResizeGroupHiddenFixture);

    // 等首次 initSpace()（onMount 内 setTimeout 0，此时容器仍 display:none）先跑完并
    // 提前 return，确保后续 toggle 命中"已经挂载过、但从未成功测量"的真实场景，
    // 而不是 toggle 抢在首次测量之前执行、掩盖 display:none 分支。
    await sleep(50);

    const toggle = document.querySelector<HTMLButtonElement>('[data-testid="toggle-visible"]')!;
    toggle.click();

    const paneA = document.querySelector('[data-testid="hidden-pane-a"]')!;
    // 600px 容器减去把手宽度后两侧各约一半，明显大于塌陷宽度（实测约 12px）。
    await expect.poll(() => paneA.getBoundingClientRect().width > 200).toBe(true);
  });
});
