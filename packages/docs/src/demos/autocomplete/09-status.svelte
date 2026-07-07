<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;width:260px">
  <!-- status 校验状态：仅影响展示样式 -->
  <AutoComplete defaultValue="ies" status="warning" placeholder="warning" />
  <AutoComplete defaultValue="ies" status="error" placeholder="error" />
  <AutoComplete defaultValue="ies" placeholder="default" />
</div>
