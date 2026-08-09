<script lang="ts">
  import { TextArea, HotKeys } from '@chenzy-design/svelte';

  let text = $state('');

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  }

  function handleChange(value: string) {
    text = value;
  }
</script>

<p style="display: flex; align-items: center;">
  使用
  <HotKeys hotKeys={['Shift', 'Enter']} style="margin-bottom: 12px; margin-left: 4px; margin-right: 4px;" />
  换行的 TextArea
</p>
<TextArea value={text} onChange={handleChange} onKeyDown={handleKeyDown} />
