<script lang="ts">
  import { CodeHighlight } from '@chenzy-design/svelte';

  const code = `function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}`;
</script>

<CodeHighlight language="javascript" {code} />
