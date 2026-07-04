<script lang="ts">
  import { CodeHighlight } from '@chenzy-design/svelte';

  const css = `.button {
  padding: 8px 16px;
  border-radius: var(--cd-border-radius-medium);
  background: var(--cd-color-primary);
}`;

  const ts = `interface User {
  id: number;
  name: string;
}

const user: User = { id: 1, name: 'Ada' };`;
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <CodeHighlight language="css" code={css} />
  <CodeHighlight language="typescript" code={ts} />
</div>
