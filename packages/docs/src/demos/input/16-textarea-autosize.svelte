<script lang="ts">
  import { TextArea } from '@chenzy-design/svelte';
</script>

<div>
  <TextArea autosize rows={1} />
  <br /><br />
  <TextArea autosize={{ minRows: 1, maxRows: 3 }} />
  <br /><br />
  <TextArea autosize maxCount={100} />
</div>
