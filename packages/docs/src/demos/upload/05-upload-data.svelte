<script lang="ts">
  import { Upload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';

  const data = { role: 'ies', time: String(Date.now()) };
  const headers = { 'x-tt-semi': 'semi-upload' };
</script>

<Upload action="/api/upload" {data} {headers}>
  <Button theme="light">
    {#snippet icon()}<IconUpload />{/snippet}
    点击上传
  </Button>
</Upload>
