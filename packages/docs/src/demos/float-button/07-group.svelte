<script lang="ts">
  import { FloatButtonGroup } from '@chenzy-design/svelte';
  import type { FloatButtonGroupItem } from '@chenzy-design/svelte';
  import {
    IconAIStrokedLevel3,
    IconSearchStroked,
    IconHelpCircleStroked,
  } from '@chenzy-design/icons';

  const items: FloatButtonGroupItem[] = [
    { icon: editIcon, content: '编辑', value: 'editor' },
    { icon: searchIcon, content: '搜索', value: 'search' },
    { icon: helpIcon, content: '帮助', value: 'help' },
  ];

  const onClick = (value: string) => {
    console.log('点击了 ', value);
  };
</script>

{#snippet editIcon()}<IconAIStrokedLevel3 />{/snippet}
{#snippet searchIcon()}<IconSearchStroked />{/snippet}
{#snippet helpIcon()}<IconHelpCircleStroked />{/snippet}

<div style="position:relative; height:120px">
  <FloatButtonGroup style="position:absolute; bottom:24px; right:24px" {items} {onClick} />
</div>
