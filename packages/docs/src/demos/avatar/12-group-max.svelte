<script lang="ts">
  import { AvatarGroup } from '@chenzy-design/svelte';

  // Svelte 里折叠走数据驱动 items（与 Semi children+maxCount 等价）
  const items = [
    { color: 'red' as const, alt: 'Lisa LeBlanc', content: 'LL' },
    { alt: 'Caroline Xiao', content: 'CX' },
    { color: 'amber' as const, alt: 'Rafal Matin', content: 'RM' },
    { alt: 'Zank Lance', content: 'ZL' },
    { alt: 'Youself Zhang', content: 'YZ' },
  ];
</script>

<AvatarGroup {items} maxCount={3} />
