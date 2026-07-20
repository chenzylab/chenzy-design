<script lang="ts">
  import { Switch, Typography } from '@chenzy-design/svelte';

  const { Title } = Typography;
  let open = $state(false);
</script>

<div style="display: flex; align-items: center;">
  <Title heading={6} style="margin: 8px;">
    {open ? '已开启' : '已关闭'}
  </Title>
  <Switch checked={open} onChange={(v) => (open = v)} aria-label="a switch for demo" />
</div>
