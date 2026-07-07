<script lang="ts">
  import { Paragraph } from '@chenzy-design/svelte';

  let value = $state('这是一段可编辑的文本，点击右侧图标即可进入编辑态。');
</script>

<div style="max-width: 480px;">
  <Paragraph
    editable
    {value}
    onChange={(next) => {
      value = next;
    }}
  >
    {value}
  </Paragraph>
</div>
