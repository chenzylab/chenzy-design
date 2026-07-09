<script lang="ts">
  import { Anchor, Text } from '@chenzy-design/svelte';

  let anchorKey = $state('#sec-1');
  const links = [
    { key: '#sec-1', href: '#sec-1', title: '第一节' },
    { key: '#sec-2', href: '#sec-2', title: '第二节' },
    { key: '#sec-3', href: '#sec-3', title: '第三节' },
  ];
</script>

<div style="width: 160px">
  <Anchor {links} value={anchorKey} onChange={(link) => (anchorKey = link?.key ?? '')} />
</div>
<Text type="tertiary">当前锚点：{anchorKey}</Text>
