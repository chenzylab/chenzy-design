<script lang="ts">
  import { TagGroup } from '@chenzy-design/svelte';

  const tagList = [
    { children: 'React' },
    { children: 'Vue' },
    { children: 'Svelte' },
    { children: 'Solid' },
    { children: 'Angular' },
  ];
</script>

<TagGroup {tagList} maxTagCount={3} />
