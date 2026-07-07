<script lang="ts">
  import { DatePicker, Space, Text } from '@chenzy-design/svelte';

  let val = $state<Date | Date[] | null>(null);
</script>

<Space vertical align="start">
  <!-- 面板四向 slot + renderDate 自定义日期内容 -->
  <Space>
    <DatePicker value={val} onChange={(d) => (val = d)}>
      {#snippet topSlot()}
        <div style="padding:8px 12px;font-size:12px;color:var(--cd-color-text-2)">选择一个日期</div>
      {/snippet}
      {#snippet bottomSlot()}
        <div style="padding:8px 12px;border-top:1px solid var(--cd-color-border);font-size:12px">
          <Text type="tertiary">点击日期即选中</Text>
        </div>
      {/snippet}
      {#snippet renderDate({ day })}
        <span style="position:relative">
          {day}
          {#if day === 1}
            <span style="position:absolute;top:-2px;right:-4px;width:4px;height:4px;border-radius:50%;background:var(--cd-color-primary)"></span>
          {/if}
        </span>
      {/snippet}
    </DatePicker>
    <Text type="tertiary">每月 1 号带小圆点</Text>
  </Space>
</Space>
