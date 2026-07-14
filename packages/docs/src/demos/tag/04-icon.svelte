<script lang="ts">
  import { Tag } from '@chenzy-design/svelte';
  import { IconGithubLogo, IconSemiLogo } from '@chenzy-design/icons';
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Tag color="light-blue" size="large" shape="circle">
    {#snippet prefixIcon()}<IconGithubLogo />{/snippet}
    Semi Design
  </Tag>
  <Tag color="cyan" size="large" shape="circle">
    {#snippet suffixIcon()}<IconSemiLogo />{/snippet}
    D2C: figma to code in one click
  </Tag>
</div>
