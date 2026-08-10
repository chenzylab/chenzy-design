<script lang="ts">
  import { Select } from '@chenzy-design/svelte';
</script>

<Select defaultValue="douyin" style="width: 120px">
  <Select.Option value="douyin" label="抖音" />
  <Select.Option value="ulikecam" label="轻颜相机" />
  <Select.Option value="jianying" label="剪映" disabled />
  <Select.Option value="xigua" label="西瓜视频" />
</Select>
<br />
<br />
<Select defaultValue="douyin" disabled style="width: 120px">
  <Select.Option value="douyin" label="抖音" />
  <Select.Option value="ulikecam" label="轻颜相机" />
</Select>
<br />
<br />
<Select placeholder="请选择业务线" style="width: 120px">
  <Select.Option value="douyin" label="抖音" />
  <Select.Option value="ulikecam" label="轻颜相机" />
  <Select.Option value="jianying" label="剪映" disabled />
  <Select.Option value="xigua" label="西瓜视频" />
</Select>
