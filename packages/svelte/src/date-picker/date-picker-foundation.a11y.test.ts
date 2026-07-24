/**
 * foundation rune 跨文件响应式验证（里程碑1 技术前提）。
 *
 * 验证 createDatePickerState(getProps) 内部 $derived 读 getProps() 回调，
 * 在外部 props 变化后能跨文件驱动派生更新——这是 foundation/view 分层的地基。
 * 若此不成立，整套 .svelte.ts foundation 架构不可行。
 *
 * 通过 FoundationReactivityFixture.svelte（真实 view→foundation 消费链）挂载，
 * rerender 改 props 后断言 DOM 反映派生更新。放 *.a11y.test.ts 走 dom project。
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Fixture from './FoundationReactivityFixture.svelte';

describe('date-picker-foundation 跨文件响应式', () => {
  it('受控 value 变化驱动 current 更新', async () => {
    const { getByTestId, rerender } = render(Fixture, {
      props: { type: 'date', value: new Date(2026, 0, 15) },
    });
    expect(getByTestId('year').textContent).toBe('2026');

    await rerender({ type: 'date', value: new Date(2030, 5, 20) });
    expect(getByTestId('year').textContent).toBe('2030');
    expect(getByTestId('month').textContent).toBe('5');
  });

  it('受控 open 变化驱动 isOpen 更新', async () => {
    const { getByTestId, rerender } = render(Fixture, {
      props: { type: 'date', open: false },
    });
    expect(getByTestId('is-open').textContent).toBe('false');

    await rerender({ type: 'date', open: true });
    expect(getByTestId('is-open').textContent).toBe('true');
  });

  it('type 变化驱动 isRange / isDateTime 分派更新', async () => {
    const { getByTestId, rerender } = render(Fixture, {
      props: { type: 'date' },
    });
    expect(getByTestId('is-range').textContent).toBe('false');
    expect(getByTestId('is-datetime').textContent).toBe('false');

    await rerender({ type: 'dateTimeRange' });
    expect(getByTestId('is-range').textContent).toBe('true');
    expect(getByTestId('is-datetime').textContent).toBe('true');
  });

  it('非受控 handleSelectedChange 更新内部值并回调 onChange（默认 dateStr 在前）', async () => {
    const onChange = vi.fn<(a: unknown, b: unknown) => void>();
    const { getByTestId, component } = render(Fixture, {
      props: { type: 'date', onChange },
    });
    expect(getByTestId('year').textContent).toBe('');

    (component as unknown as { handleSelectedChange: (d: Date) => void }).handleSelectedChange(
      new Date(2026, 0, 15),
    );
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(1);
    // 默认 onChangeWithDateFirst=false：第一参是 dateString（字符串）。
    expect(typeof onChange.mock.calls[0]![0]).toBe('string');
    // dateString 按 yyyy-MM-dd 序列化。
    expect(onChange.mock.calls[0]![0]).toBe('2026-01-15');
    // 第二参是 UTC Date（本地时区无 timeZone 时等于墙上时间）。
    expect(onChange.mock.calls[0]![1]).toBeInstanceOf(Date);
  });

  it('parseWithTimezone：受控 UTC value + timeZone 在触发器显示目标时区墙上时间', () => {
    // 2020-02-13T13:08:25Z（UTC）。东八区墙上时间 = 21:08:25。
    const utc = new Date(Date.UTC(2020, 1, 13, 13, 8, 25));
    const { getByTestId } = render(Fixture, {
      props: {
        type: 'dateTime',
        value: utc,
        timeZone: 'GMT+08:00',
        format: 'yyyy-MM-dd HH:mm:ss',
      },
    });
    // formatShowText 用墙上时间本地字段序列化 → 东八区 21 点。
    expect(getByTestId('formatted').textContent).toBe('2020-02-13 21:08:25');
  });

  it('disposeCallbackArgs：带 timeZone 时 onChange 抛回 notifyDate(UTC 绝对时刻) + dateString(目标时区墙上时间)', async () => {
    // 对齐 Semi：state 存墙上时间；disposeCallbackArgs 经 zonedTimeToUtc 得绝对 UTC Date（notifyDate），
    // 再 localeFormat（运行环境本地字段）得 dateString。dateString 呈现目标时区墙上时间，
    // notifyDate.getTime() 对应真实 UTC 绝对时刻，两者自洽。
    const onChange = vi.fn<(a: unknown, b: unknown) => void>();
    const { component } = render(Fixture, {
      props: {
        type: 'dateTime',
        timeZone: 'GMT+08:00',
        format: 'yyyy-MM-dd HH:mm:ss',
        onChange,
      },
    });
    // 面板选中的是墙上时间域：GMT+8 的 21:08:25（其绝对时刻 = 13:08:25Z）。
    const wall = new Date(2020, 1, 13, 21, 8, 25);
    (component as unknown as { handleSelectedChange: (d: Date) => void }).handleSelectedChange(wall);
    await Promise.resolve();
    // dateString：目标时区墙上时间 21:08:25。
    expect(onChange.mock.calls[0]![0]).toBe('2020-02-13 21:08:25');
    // notifyDate：绝对 UTC 时刻 = 2020-02-13T13:08:25Z。
    const notifyDate = onChange.mock.calls[0]![1] as Date;
    expect(notifyDate).toBeInstanceOf(Date);
    expect(notifyDate.toISOString()).toBe('2020-02-13T13:08:25.000Z');
  });
});
