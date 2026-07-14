<script lang="ts">
  import { Tag } from '@chenzy-design/svelte';
  import { IconAIFilledLevel1, IconAIFilledLevel3 } from '@chenzy-design/icons';

  // colorful：AI 多彩标签（字重比非多彩更重）；gradient 区分渐变色与单色。
</script>

<div style="display: flex; flex-direction: column; row-gap: 30px;">
  <!-- circle 形状 -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: fit-content;">
    <Tag colorful gradient type="solid" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful gradient type="light" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel3 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful gradient type="ghost" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel3 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="solid" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="light" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="ghost" shape="circle">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
  </div>
  <!-- square 形状 -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: fit-content;">
    <Tag colorful gradient type="solid">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful gradient type="light">
      {#snippet prefixIcon()}<IconAIFilledLevel3 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful gradient type="ghost">
      {#snippet prefixIcon()}<IconAIFilledLevel3 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="solid">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="light">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
    <Tag colorful type="ghost">
      {#snippet prefixIcon()}<IconAIFilledLevel1 size="small" />{/snippet}AI
    </Tag>
  </div>
</div>
