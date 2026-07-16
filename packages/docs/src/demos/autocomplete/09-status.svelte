<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;width:260px">
  <!-- validateStatus 校验状态：仅影响展示样式（对齐 Semi） -->
  <AutoComplete defaultValue="ies" validateStatus="warning" placeholder="warning" />
  <AutoComplete defaultValue="ies" validateStatus="error" placeholder="error" />
  <AutoComplete defaultValue="ies" placeholder="default" />
</div>
