<script lang="ts">
  import { Typography } from '@chenzy-design/svelte';
  import { IconLink } from '@chenzy-design/icons';

  const { Text } = Typography;
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Text link={{ href: 'https://semi.design/' }}>链接文本</Text>
  <Text link={{ href: 'https://semi.design/' }}>打开网站</Text>
  <Text link icon={linkIcon} underline>带下划线的网页链接</Text>
</div>

{#snippet linkIcon()}<IconLink />{/snippet}
