<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<!-- 自定义 icon 用单色 SVG（fill=currentColor）时会跟随该步状态色；
     字符串 emoji 则保留 emoji 自身颜色。 -->
{#snippet homeIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3L12 3Z" />
  </svg>
{/snippet}
{#snippet lockIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 5a3 3 0 1 1 6 0v3H9V7Z" />
  </svg>
{/snippet}

<Steps
  type="basic"
  onChange={(i) => console.log(i)}
  steps={[
    { title: '已完成', status: 'finish' },
    { title: '错误', status: 'error' },
    { title: '警告', status: 'warning' },
    { title: '正在进行', status: 'process', icon: homeIcon },
    { title: '等待', status: 'wait', icon: lockIcon },
  ]}
/>
