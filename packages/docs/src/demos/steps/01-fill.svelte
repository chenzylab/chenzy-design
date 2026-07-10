<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<Steps
  type="fill"
  current={1}
  onChange={(i) => console.log(i)}
  steps={[
    { title: '已完成', description: '这是一段描述' },
    { title: '进行中', description: '这是一段描述' },
    { title: '等待中', description: '这是一段描述' },
  ]}
/>
