<script lang="ts">
  import { Select } from '@chenzy-design/svelte';
  import { IconVigoLogo, IconGift } from '@chenzy-design/icons';

  const optionList = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'xigua', label: '西瓜视频' },
  ];
</script>

<Select style="width: 320px" defaultValue="ulikecam" showClear={true} {optionList}>
  {#snippet prefix()}
    <IconVigoLogo />
  {/snippet}
</Select>
<br />
<br />
<Select style="width: 320px" defaultValue="ulikecam" showArrow={false} {optionList}>
  {#snippet prefix()}
    <IconVigoLogo />
  {/snippet}
  {#snippet suffix()}
    <IconGift />
  {/snippet}
</Select>
