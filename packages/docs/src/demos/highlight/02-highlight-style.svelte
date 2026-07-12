<script lang="ts">
  import { Highlight } from '@chenzy-design/svelte';

  const sourceString = '从 Semi Design 到 Any Design 快速定义你的设计系统，并应用在设计稿和代码中';
  const searchWords = ['设计系统', 'Semi Design'];
</script>

<h2>
  <Highlight
    {sourceString}
    {searchWords}
    highlightStyle="border-radius: 6px; margin-left: 4px; margin-right: 4px; padding-left: 4px; padding-right: 4px; background-color: var(--cd-color-secondary); color: #fff;"
  />
</h2>
<h2>
  <Highlight
    {sourceString}
    {searchWords}
    highlightStyle="border-radius: 6px; margin-left: 4px; margin-right: 4px; padding-left: 4px; padding-right: 4px; background-color: var(--cd-color-primary); color: #fff;"
  />
</h2>
