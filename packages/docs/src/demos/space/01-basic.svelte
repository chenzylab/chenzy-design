<script lang="ts">
  import { Space, Button, Switch } from '@chenzy-design/svelte';
</script>

<Space>
  <Switch value={true} />
  <Button type="secondary">次要</Button>
  <Button type="tertiary">第三</Button>
  <Button type="warning">警告</Button>
</Space>
