<script lang="ts">
  import { Rating, Text, Space } from '@chenzy-design/svelte';

  let rateVal = $state(2.5);
</script>

<Space>
  <Rating value={rateVal} allowHalf onChange={(v) => (rateVal = v)} />
  <Text type="tertiary">评分：{rateVal}</Text>
</Space>
