<script lang="ts">
  import { RadioGroup, Radio } from '@chenzy-design/svelte';

  // type='pureCard' 实现带有背景且无 radio 的纯卡片样式。
  const extra = 'Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统';
</script>

<RadioGroup type="pureCard" defaultValue={2} direction="vertical" ariaLabel="单选组合示例" name="demo-radio-group-pureCard">
  <Radio value={1} disabled {extra} style="width: 280px;">单选框标题</Radio>
  <Radio value={2} {extra} style="width: 280px;">单选框标题</Radio>
  <Radio value={3} {extra} style="width: 280px;">单选框标题</Radio>
</RadioGroup>
