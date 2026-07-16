<script lang="ts">
  import { Tag, RadioGroup, Radio } from '@chenzy-design/svelte';

  // visible 受控标签是否可见。
  let visible = $state(false);
</script>

<div>
  <RadioGroup type="button" value={visible ? 1 : 0} onChange={(e) => (visible = e.target.value === 1)}>
    <Radio value={1}>Show</Radio>
    <Radio value={0}>Hide</Radio>
  </RadioGroup>
  <div style="margin-top: 10px;">
    <Tag {visible} size="large" color="light-blue">Invisible tag</Tag>
  </div>
</div>
