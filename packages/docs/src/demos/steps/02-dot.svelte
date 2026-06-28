<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <Steps
    current={1}
    dot
    steps={[
      { title: '已下单', description: '14:02' },
      { title: '配送中', description: '15:30' },
      { title: '已送达' },
    ]}
  />
  <Steps
    current={1}
    dot
    direction="vertical"
    steps={[
      { title: '已下单', description: '14:02' },
      { title: '配送中', description: '15:30' },
      { title: '已送达' },
    ]}
  />
</div>
