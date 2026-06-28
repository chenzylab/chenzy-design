<script lang="ts">
  import { Radio } from '@chenzy-design/svelte';

  let val = $state('a');
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  <Radio value="a" checked={val === 'a'} onChange={() => (val = 'a')}>选项 A</Radio>
  <Radio value="b" checked={val === 'b'} onChange={() => (val = 'b')}>选项 B</Radio>
  <Radio value="c" disabled>禁用选项</Radio>
</div>
