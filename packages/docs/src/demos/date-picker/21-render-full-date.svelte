<script lang="ts">
  import { DatePicker } from '@chenzy-design/svelte';

  type DayStatus = {
    isInRange: boolean;
    isHover: boolean;
    isSelected: boolean;
    isSelectedStart: boolean;
    isSelectedEnd: boolean;
  };

  // 对齐 Semi demo：inrange/hover 浅色背景；selected/start/end 主色实心白字。
  function dayStyle(s: DayStatus): string {
    const base =
      'display: flex; align-items: center; justify-content: center; width: 80%; height: 80%; border-radius: var(--cd-border-radius-circle, 50%);';
    if (s.isSelected || s.isSelectedStart || s.isSelectedEnd) {
      return `${base} color: var(--cd-color-bg-2); background: var(--cd-color-primary);`;
    }
    if (s.isInRange || s.isHover) {
      return `${base} background: var(--cd-color-primary-light-hover);`;
    }
    return base;
  }
</script>

<DatePicker style="width: 260px" type="dateRange">
  {#snippet renderFullDate({ day, dayStatus })}
    <div style={dayStyle(dayStatus as DayStatus)}>{day}</div>
  {/snippet}
</DatePicker>
