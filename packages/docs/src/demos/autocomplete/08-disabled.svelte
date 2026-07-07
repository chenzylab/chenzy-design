<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';
</script>

<div style="width: 260px">
  <!-- disabled 禁用整个组件，不可输入不可展开 -->
  <AutoComplete
    data={['gmail.com', '163.com', 'qq.com']}
    defaultValue="ies"
    disabled
    placeholder="禁用状态"
  />
</div>
