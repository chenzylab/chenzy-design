<script lang="ts">
  import { Checkbox } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
  <!-- extra 辅助文本，经 aria-describedby 关联，点击区域含辅助文本 -->
  <Checkbox extra="Semi Design 是由抖音前端团队与 UED 团队共同设计开发并维护的设计系统">
    Semi Design
  </Checkbox>
  <div style="width:280px">
    <Checkbox extra="辅助文本更长时会自动换行，整块区域均可点击切换选中态">
      带辅助文本
    </Checkbox>
  </div>
</div>
