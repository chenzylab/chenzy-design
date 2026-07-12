<script lang="ts">
  import { Highlight } from '@chenzy-design/svelte';
</script>

<h2>
  <Highlight
    component="span"
    sourceString="从 Semi Design 到 Any Design 快速定义你的设计系统，并应用在设计稿和代码中"
    searchWords={[
      { text: 'Semi', style: { backgroundColor: 'var(--cd-color-secondary)', color: '#fff', padding: 4 }, className: 'keyword1' },
      { text: '设计系统', style: { backgroundColor: 'var(--cd-color-primary)', color: '#fff', padding: 4 }, className: 'keyword2' },
      { text: '设计稿和代码', style: { backgroundColor: 'var(--cd-color-tertiary)', color: '#fff', padding: 4 }, className: 'keyword3' },
    ]}
    highlightStyle="border-radius: 4px;"
  />
</h2>
