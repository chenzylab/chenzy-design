<script lang="ts">
  import { Timeline } from '@chenzy-design/svelte';

  const dataSource = [
    { key: '1', content: '初始化项目', time: '1月' },
    { key: '2', content: '完成核心功能', time: '3月' },
    { key: '3', content: '公测发布', time: '6月' },
    { key: '4', content: '正式上线', time: '9月' },
  ];
</script>

<Timeline {dataSource} mode="alternate" />
