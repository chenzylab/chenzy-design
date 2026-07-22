<script lang="ts">
  import { Tag, Space } from '@chenzy-design/svelte';
  import { IconGithubLogo, IconSemiLogo } from '@chenzy-design/icons';
</script>

<Space>
  <Tag color="light-blue" size="large" shape="circle">
    {#snippet prefixIcon()}<IconGithubLogo />{/snippet}
    Semi Design
  </Tag>
  <Tag color="cyan" size="large" shape="circle">
    {#snippet suffixIcon()}<IconSemiLogo />{/snippet}
    D2C: figma to code in one click
  </Tag>
</Space>
