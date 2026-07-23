<script lang="ts">
  import { Tooltip, Button, Input, RadioGroup, Radio } from '@chenzy-design/svelte';

  let visible = $state(false);
  // container 需要设置 position: relative
  let containerEl = $state<HTMLDivElement | null>(null);
  const getPopupContainer = () => containerEl;
</script>

<div style="width: 100%; height: 100%; overflow: hidden; position: relative;" bind:this={containerEl}>
  <div style="width: 150%; height: 150%; padding-left: 50px; padding-top: 50px;">
    <Tooltip content="hi bytedance" {getPopupContainer}>
      <Button theme="solid" type="tertiary" style="margin-bottom: 20px;">悬停显示</Button>
    </Tooltip>
    <br />
    <Tooltip content="hi bytedance" trigger="click" {getPopupContainer}>
      <Button style="margin-bottom: 20px;">点击显示</Button>
    </Tooltip>
    <br />
    <Tooltip content="hi bytedance" trigger="focus" {getPopupContainer}>
      <Input style="width: 100px; margin-bottom: 20px;" placeholder="聚焦显示" />
    </Tooltip>
    <br />
    <Tooltip content="hi bytedance" trigger="contextMenu" {getPopupContainer}>
      <Button theme="solid" type="secondary" style="margin-bottom: 20px;">右键点击展示</Button>
    </Tooltip>
    <br />
    <Tooltip content="hi bytedance" trigger="custom" {visible} {getPopupContainer}>
      <span style="display: inline-block;">
        <RadioGroup
          type="button"
          onChange={(e) => (visible = e.target.value as boolean)}
          value={visible}
        >
          <Radio value={true}>受控显示</Radio>
          <Radio value={false}>受控隐藏</Radio>
        </RadioGroup>
      </span>
    </Tooltip>
  </div>
</div>
