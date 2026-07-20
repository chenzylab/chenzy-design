<script lang="ts">
  import { Switch, Space } from '@chenzy-design/svelte';
</script>

<div>
  <Space style="margin-bottom: 10px; display: block;">
    <Switch size="small" aria-label="a switch for demo"></Switch>
    <Switch defaultChecked size="small" aria-label="a switch for demo"></Switch>
    <Switch size="small" loading aria-label="a switch for demo" />
    <Switch size="small" loading defaultChecked aria-label="a switch for demo" />
  </Space>
  <Space style="margin-bottom: 10px; display: block;">
    <Switch></Switch>
    <Switch defaultChecked aria-label="a switch for demo"></Switch>
    <Switch loading aria-label="a switch for demo" />
    <Switch loading defaultChecked aria-label="a switch for demo" />
  </Space>
  <Space>
    <Switch size="large"></Switch>
    <Switch defaultChecked size="large"></Switch>
    <Switch size="large" loading />
    <Switch size="large" loading defaultChecked />
  </Space>
</div>
