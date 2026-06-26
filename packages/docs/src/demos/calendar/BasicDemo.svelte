<script lang="ts">
  import { Calendar, Text, Divider } from '@chenzy-design/svelte';

  const calAnchor = new Date(2026, 5, 1);
  const calEvents = [
    { key: 'm1', start: new Date(2026, 5, 3), title: '周会' },
    { key: 'm2', start: new Date(2026, 5, 10), title: '设计评审' },
    { key: 'm3', start: new Date(2026, 5, 10), title: '需求对齐' },
    { key: 'm4', start: new Date(2026, 5, 10), title: '联调' },
    { key: 'm5', start: new Date(2026, 5, 10), title: '复盘' },
    { key: 'm6', start: new Date(2026, 5, 15), end: new Date(2026, 5, 17), title: '出差', color: 'var(--cd-color-warning)' },
    { key: 'm7', start: new Date(2026, 5, 22), title: '发版', color: 'var(--cd-color-success)' },
  ];

  const calDayAnchor = new Date(2026, 5, 10);
  const calDayEvents = [
    { key: 'd0', start: new Date(2026, 5, 10), title: '团队站会（全天）', allDay: true },
    { key: 'd5', start: new Date(2026, 5, 9), end: new Date(2026, 5, 11), title: '出差（跨天）', color: 'var(--cd-color-warning)' },
    { key: 'd1', start: new Date(2026, 5, 10, 9, 30), title: '需求评审' },
    { key: 'd2', start: new Date(2026, 5, 10, 11, 0), title: '一对一' },
    { key: 'd3', start: new Date(2026, 5, 10, 14, 0), title: '设计联调', color: 'var(--cd-color-success)' },
    { key: 'd4', start: new Date(2026, 5, 10, 14, 45), title: '客户演示' },
  ];

  let calSelectedText = $state('（未选）');
  let calRangeText = $state('（未选）');
  let calPopupText = $state('（未选）');

  function fmtDay(d: Date) {
    return d.toLocaleDateString('zh-CN');
  }
</script>

<Text type="tertiary">月视图（事件展示 + 6/10 当天溢出折叠 + 跨天事件）</Text>
<Calendar
  defaultValue={calAnchor}
  events={calEvents}
  maxEventsPerDay={3}
  onSelect={(info) => (calSelectedText = info.date.toLocaleDateString('zh-CN'))}
/>
<Text type="tertiary">选中日期：{calSelectedText}</Text>

<Divider />

<Text type="tertiary">mode="week"：单行 7 天，周导航前后切换</Text>
<div data-testid="calendar-week">
  <Calendar mode="week" defaultValue={calAnchor} events={calEvents} maxEventsPerDay={4} />
</div>

<Divider />

<Text type="tertiary">mode="day"：纵向逐小时时间轴（8–20 时），全天 / 跨天事件入顶部「全天」区</Text>
<div data-testid="calendar-day">
  <Calendar
    mode="day"
    defaultValue={calDayAnchor}
    dayStartHour={8}
    dayEndHour={20}
    events={calDayEvents}
  />
</div>

<Divider />

<Text type="tertiary">selectionMode="range"：点两天选范围，区间高亮 + hover 预览</Text>
<div data-testid="calendar-range">
  <Calendar
    selectionMode="range"
    defaultValue={calAnchor}
    onRangeChange={(info) =>
      (calRangeText = `${fmtDay(info.range[0])} ~ ${fmtDay(info.range[1])}`)}
  />
</div>
<Text type="tertiary">选中范围：{calRangeText}</Text>

<Divider />

<Text type="tertiary">popup：点击 trigger 弹出日历浮层，外部点击 / Esc 关闭</Text>
<div data-testid="calendar-popup">
  <Calendar
    popup
    defaultValue={calAnchor}
    events={calEvents}
    onSelect={(info) => (calPopupText = info.date.toLocaleDateString('zh-CN'))}
  />
</div>
<Text type="tertiary">弹层选中：{calPopupText}</Text>
