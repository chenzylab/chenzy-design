<script lang="ts">
  import { RadioGroup, Radio } from '@chenzy-design/svelte';

  const extra = 'Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统';
</script>

<!-- type="card" 带背景卡片；type="pureCard" 无 radio 的纯卡片 -->
<div style="display:flex;gap:24px;flex-wrap:wrap">
  <RadioGroup type="card" direction="vertical" defaultValue={2}>
    <div style="width:280px"><Radio value={1} disabled {extra}>卡片一（禁用）</Radio></div>
    <div style="width:280px"><Radio value={2} {extra}>卡片二</Radio></div>
    <div style="width:280px"><Radio value={3} {extra}>卡片三</Radio></div>
  </RadioGroup>

  <RadioGroup type="pureCard" direction="vertical" defaultValue={2}>
    <div style="width:280px"><Radio value={1} {extra}>纯卡片一</Radio></div>
    <div style="width:280px"><Radio value={2} {extra}>纯卡片二</Radio></div>
    <div style="width:280px"><Radio value={3} {extra}>纯卡片三</Radio></div>
  </RadioGroup>
</div>
