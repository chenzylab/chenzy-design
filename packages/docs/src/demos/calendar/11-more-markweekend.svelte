<script lang="ts">
  import { Calendar, Tag, Text } from '@chenzy-design/svelte';
  import type { CalendarEvent } from '@chenzy-design/svelte';

  // 增强场景（Semi 未单列）：markWeekend 区分周末 + 「还有 N 项」溢出折叠 + Tag 上色事件。
  const anchor = new Date(2026, 5, 1);
  let moreText = $state('（未点击）');
</script>

<!-- 每个事件的 children 直接是带颜色的 Tag（对齐 Semi children 内联节点）。 -->
{#snippet tag(label: string, color: 'primary' | 'success' | 'warning' | 'danger')}
  <Tag size="small" {color}>{label}</Tag>
{/snippet}
{#snippet c1()}{@render tag('周会', 'success')}{/snippet}
{#snippet c2()}{@render tag('设计评审', 'warning')}{/snippet}
{#snippet c3()}{@render tag('需求对齐', 'primary')}{/snippet}
{#snippet c4()}{@render tag('联调', 'primary')}{/snippet}
{#snippet c5()}{@render tag('复盘', 'success')}{/snippet}
{#snippet c6()}{@render tag('发版', 'danger')}{/snippet}

<Calendar
  mode="month"
  displayValue={anchor}
  markWeekend
  events={[
    { key: 'c1', start: new Date(2026, 5, 3), children: c1 },
    { key: 'c2', start: new Date(2026, 5, 10), children: c2 },
    { key: 'c3', start: new Date(2026, 5, 10), children: c3 },
    { key: 'c4', start: new Date(2026, 5, 10), children: c4 },
    { key: 'c5', start: new Date(2026, 5, 10), children: c5 },
    { key: 'c6', start: new Date(2026, 5, 22), children: c6 },
  ] satisfies CalendarEvent[]}
  onMoreClick={(_e, date, remaining) => (moreText = `${date.toLocaleDateString('zh-CN')} 还有 ${remaining} 项`)}
/>
<Text type="tertiary">「还有 N 项」：{moreText}</Text>
