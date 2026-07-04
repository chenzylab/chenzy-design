<script lang="ts">
  import { CodeHighlight } from '@chenzy-design/svelte';

  const code = `const list = [1, 2, 3, 4, 5];
const doubled = list.map((n) => n * 2);
const sum = doubled.reduce((a, b) => a + b, 0);
console.log(sum);`;
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <CodeHighlight language="javascript" {code} lineNumber />
  <CodeHighlight language="javascript" {code} lineNumber={false} />
</div>
