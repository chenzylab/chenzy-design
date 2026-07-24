<script lang="ts">
  import { InputNumber } from '@chenzy-design/svelte';
</script>

<InputNumber
  formatter={(value) => `${value}`.replace(/\D/g, '')}
  onNumberChange={(number) => console.log(number)}
  min={0}
  max={Number.MAX_SAFE_INTEGER}
/>
