<script lang="ts">
  import { RadioGroup, Radio, Space } from '@chenzy-design/svelte';

  // type='button' 渲染按钮样式单选器，支持 small / middle / large 三种尺寸。
  // 注意：button 类型暂不支持辅助文本（extra）和垂直排列（direction='vertical'）。
</script>

<Space vertical spacing="loose" align="start">
  <RadioGroup type="button" buttonSize="small" defaultValue={1} ariaLabel="单选组合示例" name="demo-radio-small">
    <Radio value={1}>即时推送</Radio>
    <Radio value={2}>定时推送</Radio>
    <Radio value={3}>动态推送</Radio>
  </RadioGroup>
  <RadioGroup type="button" buttonSize="middle" defaultValue={1} ariaLabel="单选组合示例" name="demo-radio-middle">
    <Radio value={1}>即时推送</Radio>
    <Radio value={2}>定时推送</Radio>
    <Radio value={3}>动态推送</Radio>
  </RadioGroup>
  <RadioGroup type="button" buttonSize="large" defaultValue={1} ariaLabel="单选组合示例" name="demo-radio-large">
    <Radio value={1}>即时推送</Radio>
    <Radio value={2}>定时推送</Radio>
    <Radio value={3}>动态推送</Radio>
  </RadioGroup>
</Space>
