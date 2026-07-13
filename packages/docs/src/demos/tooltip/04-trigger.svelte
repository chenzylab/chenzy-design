<script lang="ts">
  import { Tooltip, Button, Input, RadioGroup, Radio } from '@chenzy-design/svelte';

  let visible = $state(false);
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <Tooltip content="hi bytedance">
    <Button>悬停显示（默认 hover）</Button>
  </Tooltip>

  <Tooltip content="hi bytedance" trigger="click">
    <Button>点击显示</Button>
  </Tooltip>

  <Tooltip content="hi bytedance" trigger="focus">
    <span style="display: inline-block; width: 160px;">
      <Input placeholder="聚焦显示" />
    </span>
  </Tooltip>

  <Tooltip content="hi bytedance" trigger="custom" {visible}>
    <span style="display: inline-block;">
      <RadioGroup
        type="button"
        value={visible}
        onChange={(v) => (visible = v as boolean)}
      >
        <Radio value={true}>受控显示</Radio>
        <Radio value={false}>受控隐藏</Radio>
      </RadioGroup>
    </span>
  </Tooltip>
</div>
