<script lang="ts">
  import { Popconfirm, Button, RadioGroup, Radio } from '@chenzy-design/svelte';

  type PopType = 'default' | 'warning' | 'danger';
  let type = $state<PopType>('default');
  let visible = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 14px; align-items: flex-start;">
  <RadioGroup type="button" value={type} onChange={(v) => (type = v as PopType)}>
    <Radio value="default">default</Radio>
    <Radio value="warning">warning</Radio>
    <Radio value="danger">danger</Radio>
  </RadioGroup>

  <Popconfirm
    {type}
    {visible}
    trigger="custom"
    title="确定是否要保存此修改？"
    content="此修改将不可逆"
    onVisibleChange={(v) => (visible = v)}
  >
    <Button onclick={() => (visible = !visible)}>点击此处</Button>
  </Popconfirm>
</div>
