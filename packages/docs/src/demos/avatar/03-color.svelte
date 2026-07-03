<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  const palette = [
    'amber', 'blue', 'cyan', 'green', 'indigo', 'light-blue',
    'light-green', 'lime', 'orange', 'pink', 'purple', 'red',
    'teal', 'violet', 'yellow',
  ] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <div>
    <div style="margin-bottom: 8px; font-size: 13px; color: var(--cd-color-text-2);">
      自动配色（color="auto"，按文字哈希）
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      <Avatar color="auto" alt="陈">陈</Avatar>
      <Avatar color="auto" alt="张">张</Avatar>
      <Avatar color="auto" alt="李">李</Avatar>
      <Avatar color="auto" alt="王">王</Avatar>
      <Avatar color="auto" alt="赵">赵</Avatar>
    </div>
  </div>

  <div>
    <div style="margin-bottom: 8px; font-size: 13px; color: var(--cd-color-text-2);">
      预设 16 档语义色板（对齐 Semi）
    </div>
    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      {#each palette as c (c)}
        <Avatar color={c} alt={c}>{c.charAt(0).toUpperCase()}</Avatar>
      {/each}
    </div>
  </div>
</div>
