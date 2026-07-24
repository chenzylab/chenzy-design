<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<TagInput separator="-" placeholder="使用 - 进行批量输入" onChange={(v) => console.log(v)} />
<br />
<br />
<TagInput
  separator={['-', '/', '|', '++']}
  placeholder="支持多个分隔符进行批量输入"
  onChange={(v) => console.log(v)}
/>
