<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  // square 放文字（"直播中"），circle 放图标/单符号（对齐 Semi：长文字不放 circle）
  const squareSlot = { shape: 'square' as const, bgColor: '#FE2C55', text: '直播中' };
</script>

<!-- 加号图标 Snippet，供 circle slot 使用（对齐 Semi circle=<IconPlus/>） -->
{#snippet plusIcon()}
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
{/snippet}

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- 方形：放文字 -->
  <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
    <Avatar color="amber" bottomSlot={squareSlot}>T</Avatar>
    <Avatar color="amber" size="large" bottomSlot={squareSlot}>T</Avatar>
    <Avatar color="amber" size="extra-large" bottomSlot={squareSlot}>T</Avatar>
  </div>
  <!-- 圆形：放图标 -->
  <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
    <Avatar color="amber" bottomSlot={{ shape: 'circle', bgColor: '#FE2C55', text: plusIcon }}
      >T</Avatar
    >
    <Avatar
      color="amber"
      size="large"
      bottomSlot={{ shape: 'circle', bgColor: '#FE2C55', text: plusIcon }}>T</Avatar
    >
    <Avatar
      color="amber"
      size="extra-large"
      bottomSlot={{ shape: 'circle', bgColor: '#FE2C55', text: plusIcon }}>T</Avatar
    >
  </div>
</div>
