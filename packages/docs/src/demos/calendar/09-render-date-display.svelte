<script lang="ts">
  import { Calendar, Avatar } from '@chenzy-design/svelte';
  import type { AvatarColor } from '@chenzy-design/svelte';

  // 对齐 Semi「自定义日期文案」：renderDateDisplay 用 Avatar 渲染周视图日期头。
  const displayValue = new Date(2023, 4, 14);
  const colors: AvatarColor[] = ['amber', 'blue', 'cyan', 'green', 'grey', 'indigo', 'lime'];
</script>

<!-- renderDateDisplay 是接收 date 的 Snippet（对齐 Semi date => ReactNode）。 -->
{#snippet renderDateDisplay(date: Date)}
  <Avatar size="small" color={colors[date.getDay()]}>{date.getDate()}</Avatar>
{/snippet}

<Calendar mode="week" height={400} {displayValue} {renderDateDisplay} />
