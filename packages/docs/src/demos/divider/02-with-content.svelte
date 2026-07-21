<script lang="ts">
  import { Divider } from '@chenzy-design/svelte';
  import { IconSemiLogo } from '@chenzy-design/icons';
</script>

<div>
  <Divider margin="12px" align="left">这是居左文字</Divider>

  <Divider margin="12px" align="center">这是居中文字</Divider>

  <Divider margin="12px" align="right">这是居右文字</Divider>

  <Divider margin="12px">
    <IconSemiLogo />
  </Divider>
</div>
