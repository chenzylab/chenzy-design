<script lang="ts">
  import { Timeline } from '@chenzy-design/svelte';

  const dataSource = [
    { key: '1', content: '创建订单', time: '2024-06-01 10:00' },
    { key: '2', content: '支付成功', time: '2024-06-01 10:05' },
    { key: '3', content: '商家接单', time: '2024-06-01 10:30' },
    { key: '4', content: '配送中', time: '2024-06-01 14:00' },
  ];
</script>

<Timeline {dataSource} />
