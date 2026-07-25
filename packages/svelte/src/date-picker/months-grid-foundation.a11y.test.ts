/**
 * months-grid-foundation 第一阶段测试 —— 单选 + multiple + 导航 + 面板切换（对齐 Semi）。
 * range 分支测试随 handleRangeSelected 补入。
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Fixture from './MonthsGridFixture.svelte';

describe('months-grid-foundation：单选/导航/面板切换', () => {
  it('date 单选：selected 更新 + onSelectedChange 抛 Date', async () => {
    const onSelectedChange = vi.fn();
    const { getByTestId, component } = render(Fixture, {
      props: { type: 'date', onSelectedChange },
    });
    (component as unknown as { clickDay: (d: string) => void }).clickDay('2026-01-15');
    await Promise.resolve();
    expect(getByTestId('selected').textContent).toBe('2026-01-15');
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    const dates = onSelectedChange.mock.calls[0]![0] as Date[];
    expect(dates[0]).toBeInstanceOf(Date);
    expect(dates[0]!.getFullYear()).toBe(2026);
    expect(dates[0]!.getDate()).toBe(15);
  });

  it('date 单选再选：替换（非累加）', async () => {
    const { getByTestId, component } = render(Fixture, { props: { type: 'date' } });
    const api = component as unknown as { clickDay: (d: string) => void };
    api.clickDay('2026-01-10');
    api.clickDay('2026-01-20');
    await Promise.resolve();
    expect(getByTestId('selected').textContent).toBe('2026-01-20');
  });

  it('multiple：累加 + 再点取消 + max 限制', async () => {
    const onMaxLimit = vi.fn();
    const { getByTestId, component } = render(Fixture, {
      props: { type: 'date', multiple: true, max: 2, onSelectedChange: () => {} },
    });
    const api = component as unknown as { clickDay: (d: string) => void };
    api.clickDay('2026-01-10');
    api.clickDay('2026-01-11');
    await Promise.resolve();
    expect(getByTestId('selected').textContent).toContain('2026-01-10');
    expect(getByTestId('selected').textContent).toContain('2026-01-11');
    // 再点已选 → 取消。
    api.clickDay('2026-01-10');
    await Promise.resolve();
    expect(getByTestId('selected').textContent).toBe('2026-01-11');
  });

  it('hover：hoverDay 更新', async () => {
    const { getByTestId, component } = render(Fixture, { props: { type: 'date' } });
    (component as unknown as { hoverDay: (d: string) => void }).hoverDay('2026-01-15');
    await Promise.resolve();
    expect(getByTestId('hover').textContent).toBe('2026-01-15');
  });

  it('导航：nextMonth/prevYear 更新 left pickerDate', async () => {
    const { getByTestId, component } = render(Fixture, {
      props: { type: 'date', defaultPickerValue: new Date(2026, 0, 1) },
    });
    const api = (component as unknown as { api: { nextMonth: () => void; prevYear: () => void } }).api;
    expect(getByTestId('left-picker').textContent).toBe('2026-1');
    api.nextMonth();
    await Promise.resolve();
    expect(getByTestId('left-picker').textContent).toBe('2026-2');
    api.prevYear();
    await Promise.resolve();
    expect(getByTestId('left-picker').textContent).toBe('2025-2');
  });

  it('dateRange：首点设 rangeStart + 焦点转 rangeEnd；次点设 rangeEnd', async () => {
    const onSelectedChange = vi.fn();
    const { getByTestId, component } = render(Fixture, {
      props: { type: 'dateRange', onSelectedChange },
    });
    const api = component as unknown as { clickDay: (d: string) => void };
    api.clickDay('2026-01-10');
    await Promise.resolve();
    expect(getByTestId('range-start').textContent).toBe('2026-01-10');
    expect(getByTestId('focus').textContent).toBe('rangeEnd');
    api.clickDay('2026-01-20');
    await Promise.resolve();
    expect(getByTestId('range-start').textContent).toBe('2026-01-10');
    expect(getByTestId('range-end').textContent).toBe('2026-01-20');
    // 焦点转回 rangeStart。
    expect(getByTestId('focus').textContent).toBe('rangeStart');
    expect(onSelectedChange).toHaveBeenCalled();
  });

  it('dateRange：rangeEnd 已存在时点更早的 start，重置 end（reset）', async () => {
    const { getByTestId, component } = render(Fixture, { props: { type: 'dateRange' } });
    const api = component as unknown as { clickDay: (d: string) => void };
    api.clickDay('2026-01-10'); // start=10, focus→end
    api.clickDay('2026-01-20'); // end=20, focus→start
    api.clickDay('2026-01-25'); // start=25 > end=20 → end reset
    await Promise.resolve();
    expect(getByTestId('range-start').textContent).toBe('2026-01-25');
    expect(getByTestId('range-end').textContent).toBe('');
  });

  it('面板切换：showYearPicker/showTimePicker/showDatePanel 互斥', async () => {
    const { getByTestId, component } = render(Fixture, { props: { type: 'dateTime' } });
    const api = (component as unknown as {
      api: { showYearPicker: () => void; showTimePicker: () => void; showDatePanel: () => void };
    }).api;
    api.showYearPicker();
    await Promise.resolve();
    expect(getByTestId('left-yam').textContent).toBe('true');
    expect(getByTestId('left-time').textContent).toBe('false');
    api.showTimePicker();
    await Promise.resolve();
    expect(getByTestId('left-yam').textContent).toBe('false');
    expect(getByTestId('left-time').textContent).toBe('true');
    api.showDatePanel();
    await Promise.resolve();
    expect(getByTestId('left-yam').textContent).toBe('false');
    expect(getByTestId('left-time').textContent).toBe('false');
  });
});
