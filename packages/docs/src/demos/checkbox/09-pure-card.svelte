<script lang="ts">
  import { CheckboxGroup, Checkbox } from '@chenzy-design/svelte';
</script>

<!-- type="pureCard"：带背景、无 checkbox 框的纯卡片样式 -->
<CheckboxGroup type="pureCard" direction="vertical" defaultValue={['1', '3']}>
  <div style="width:280px"><Checkbox value="1" disabled extra="Semi Design 是由抖音前端与 UED 团队共同维护的设计系统">套餐一</Checkbox></div>
  <div style="width:280px"><Checkbox value="2" extra="Semi Design 是由抖音前端与 UED 团队共同维护的设计系统">套餐二</Checkbox></div>
  <div style="width:280px"><Checkbox value="3" extra="Semi Design 是由抖音前端与 UED 团队共同维护的设计系统">套餐三</Checkbox></div>
</CheckboxGroup>
