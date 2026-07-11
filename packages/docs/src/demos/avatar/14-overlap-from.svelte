<script lang="ts">
  import { AvatarGroup } from '@chenzy-design/svelte';

  const items = [
    { color: 'red' as const, alt: 'Lisa LeBlanc', content: 'LL' },
    { alt: 'Caroline Xiao', content: 'CX' },
    { color: 'amber' as const, alt: 'Rafal Matin', content: 'RM' },
    { alt: 'Zank Lance', content: 'ZL' },
    { alt: 'Youself Zhang', content: 'YZ' },
  ];
</script>

<!-- overlapFrom 控制层叠压盖方向：start=前压后，end=后压前 -->
<div style="display: flex; flex-direction: column; gap: 16px;">
  <AvatarGroup {items} overlapFrom="start" />
  <AvatarGroup {items} overlapFrom="end" />
</div>
