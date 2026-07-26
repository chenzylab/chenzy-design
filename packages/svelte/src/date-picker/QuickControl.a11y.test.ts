/**
 * QuickControl 测试 —— 对齐 Semi datePicker/quickControl.tsx。
 * presets 渲染为 Button + Text；presetPosition/type 派生 class；top/bottom 无 header；空不渲染。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import QuickControl from './QuickControl.svelte';

const PREFIX = 'cd-datepicker';

const presets = [
  { text: '今天', start: new Date(2026, 0, 15) },
  { text: '本周', start: new Date(2026, 0, 12), end: new Date(2026, 0, 18) },
];

describe('QuickControl 对齐 Semi', () => {
  it('presets 渲染为按钮 + 文本，wrapper 带 position class', async () => {
    const { container } = renderWithLocale(QuickControl, {
      props: { presets, presetPosition: 'bottom', type: 'date' },
    });
    const wrapper = container.querySelector(`.${PREFIX}-quick-control`);
    expect(wrapper).not.toBeNull();
    expect(wrapper?.classList.contains(`${PREFIX}-quick-control-bottom`)).toBe(true);
    expect(wrapper?.classList.contains(`${PREFIX}-quick-control-date`)).toBe(true);
    const btns = container.querySelectorAll('button');
    expect(btns.length).toBe(2);
    expect(container.textContent).toContain('今天');
    await expectNoAxeViolations(container);
  });

  it('top/bottom 无 header；left/right 有 header（locale presets）', () => {
    const { container: bottom } = renderWithLocale(QuickControl, {
      props: { presets, presetPosition: 'bottom' },
    });
    expect(bottom.querySelector(`.${PREFIX}-quick-control-header`)).toBeNull();

    const { container: left } = renderWithLocale(QuickControl, {
      props: { presets, presetPosition: 'left' },
    });
    const header = left.querySelector(`.${PREFIX}-quick-control-header`);
    expect(header).not.toBeNull();
    expect(header?.textContent).toContain('Presets');
  });

  it('点击预设触发 onPresetClick（携带 preset）', () => {
    const onPresetClick = vi.fn();
    const { container } = renderWithLocale(QuickControl, {
      props: { presets, onPresetClick },
    });
    (container.querySelector('button') as HTMLElement).click();
    expect(onPresetClick).toHaveBeenCalledTimes(1);
    expect(onPresetClick.mock.calls[0]![0]).toMatchObject({ text: '今天' });
  });

  it('presets 为空不渲染', () => {
    const { container } = renderWithLocale(QuickControl, { props: { presets: [] } });
    expect(container.querySelector(`.${PREFIX}-quick-control`)).toBeNull();
  });
});
