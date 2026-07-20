<script lang="ts">
  import { CheckboxGroup, Checkbox } from '@chenzy-design/svelte';

  const extra = 'Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统';
</script>

<CheckboxGroup type="pureCard" defaultValue={['1', '3']} direction="vertical" ariaLabel="CheckboxGroup 示例">
  <Checkbox value="1" disabled {extra} style="width: 280px;">多选框标题</Checkbox>
  <Checkbox value="2" disabled {extra} style="width: 280px;">多选框标题</Checkbox>
  <Checkbox value="3" {extra} style="width: 280px;">多选框标题</Checkbox>
  <Checkbox value="4" {extra} style="width: 280px;">多选框标题</Checkbox>
</CheckboxGroup>
