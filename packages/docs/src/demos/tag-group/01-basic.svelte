<script lang="ts">
  import { TagGroup } from '@chenzy-design/svelte';

  const tagList = [
    { children: '设计', color: 'primary' as const },
    { children: '前端', color: 'success' as const },
    { children: '后端', color: 'warning' as const },
  ];
</script>

<TagGroup {tagList} />
