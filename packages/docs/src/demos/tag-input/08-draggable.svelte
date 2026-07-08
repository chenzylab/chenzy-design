<script lang="ts">
  import { TagInput } from '@chenzy-design/svelte';
</script>

<div style="width: 360px">
  <TagInput
    draggable
    allowDuplicates={false}
    defaultValue={['需求', '设计', '开发', '测试', '上线']}
    placeholder="输入后回车添加"
  />
</div>
