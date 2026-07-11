<script lang="ts">
  import { Avatar } from '@chenzy-design/svelte';

  const src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=live';
</script>

<!-- 组合效果：图片头像 + border 呼吸动画 + contentMotion + 顶部直播气泡 + 底部圆形图标（对齐 Semi 抖音直播头像） -->
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

<Avatar
  alt="正在直播"
  {src}
  size="large"
  border={{ color: '#FE2C55', motion: true }}
  contentMotion
  topSlot={{
    text: '直播',
    gradientStart: 'rgb(255,23,100)',
    gradientEnd: 'rgb(237,52,148)',
  }}
  bottomSlot={{ shape: 'circle', bgColor: '#FE2C55', text: plusIcon }}
/>
