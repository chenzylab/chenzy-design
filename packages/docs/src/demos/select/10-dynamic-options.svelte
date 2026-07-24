<script lang="ts">
  import { Select, Button } from '@chenzy-design/svelte';

  let options = $state<number[]>([1, 2, 3, 4]);

  function add() {
    // 运行时动态更新 optionList；配合受控 value 使用。
    const length = 1 + (options.length % 10);
    options = Array.from({ length }, (_, i) => i + 1);
  }

  const optionList = $derived(options.map((o) => ({ value: o, label: String(o) })));
</script>

<Select style="width: 180px" placeholder="请选择" value={4} {optionList} />
<br />
<br />
<Button onclick={add}>changeOptions Dynamic</Button>
