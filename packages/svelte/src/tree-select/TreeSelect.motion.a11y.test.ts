// 进/退场动画状态机（对齐 Semi CSSAnimation transitionState + onAnimationEnd）：
// jsdom 不真实播放 CSS animation（无 layout/paint），故用 dispatchEvent 手动模拟
// animationend 来验证 JS 状态机本身的正确性——CSS 动画实际播放时长是浏览器职责，
// 不在此验证范围（真机 CDP 环境下标签页未获渲染焦点时 animation 会被节流/冻结，
// 见 memory「真机 hidden 冻结用 jsdom 补测试」，此为该教训的直接应用）。
// 单层结构（对齐 Select/Tooltip 既有模式）：动画 class 与 use:floating 定位同挂在
// .cd-tree-select-panel 本身（用独立 CSS `scale` 属性与 inline transform:translate 正交共存）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import TreeSelect from './TreeSelect.svelte';

const treeData = [
  { key: 'a', label: 'Asia', children: [{ key: 'a-1', label: 'China' }] },
  { key: 'b', label: 'North America' },
];

function getPanel(): HTMLElement | null {
  return document.querySelector('.cd-tree-select-panel');
}
function fireAnimationEnd(el: Element): void {
  el.dispatchEvent(new Event('animationend', { bubbles: true }));
}

describe('TreeSelect 面板进出场动画状态机', () => {
  it('打开：面板立即可见（无需等待动画），带 show 动画 class', async () => {
    renderWithLocale(TreeSelect, { props: { treeData, defaultOpen: true } });
    const panel = getPanel();
    expect(panel).not.toBeNull();
    expect(panel?.className).not.toContain('cd-tree-select-hidden');
    expect(panel?.className).toContain('cd-tree-select-panel-motion-show');
    expect(panel?.className).not.toContain('cd-tree-select-panel-motion-hide');
  });

  it('关闭：面板不立即隐藏（先播放 hide 动画），animationend 后才真正隐藏', async () => {
    const { component } = renderWithLocale(TreeSelect, {
      props: { treeData, defaultOpen: true },
    });
    const trigger = document.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    await new Promise((r) => setTimeout(r, 0));

    const panel = getPanel();
    // 关闭瞬间：面板仍未隐藏（等待退场动画），已切到 hide 动画 class
    expect(panel?.className).not.toContain('cd-tree-select-hidden');
    expect(panel?.className).toContain('cd-tree-select-panel-motion-hide');

    // 模拟浏览器动画播放完毕触发 animationend
    fireAnimationEnd(panel as Element);
    await new Promise((r) => setTimeout(r, 0));

    expect(getPanel()?.className).toContain('cd-tree-select-hidden');
    void component;
  });

  it('motion=false：关闭立即隐藏，无中间态', async () => {
    renderWithLocale(TreeSelect, { props: { treeData, defaultOpen: true, motion: false } });
    const trigger = document.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    await new Promise((r) => setTimeout(r, 0));

    // motion=false：没有动画 class，立即 panelHidden=true，无需等待 animationend
    expect(getPanel()?.className).toContain('cd-tree-select-hidden');
  });

  it('关闭后未等 animationend 又重新打开：立即撤销 hide 态，展示 show 动画', async () => {
    renderWithLocale(TreeSelect, { props: { treeData, defaultOpen: true } });
    const trigger = document.querySelector('[role="combobox"]') as HTMLElement;
    trigger.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(getPanel()?.className).toContain('cd-tree-select-panel-motion-hide');

    // 未等 hide 动画结束就重新点击打开（不 fireAnimationEnd）
    trigger.click();
    await new Promise((r) => setTimeout(r, 0));

    const panel = getPanel();
    expect(panel?.className).not.toContain('cd-tree-select-hidden');
    expect(panel?.className).toContain('cd-tree-select-panel-motion-show');
    expect(panel?.className).not.toContain('cd-tree-select-panel-motion-hide');
  });
});
