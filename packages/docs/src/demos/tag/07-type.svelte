<script lang="ts">
  import { Tag, Space } from '@chenzy-design/svelte';
  import { IconGithubLogo, IconSemiLogo } from '@chenzy-design/icons';

  // 样式类型：light 浅色底 / ghost 白色底镂空 / solid 深色底。默认 light。
</script>

<Space wrap>
  <Tag color="light-blue" size="large" shape="circle" type="light">
    {#snippet prefixIcon()}<IconGithubLogo />{/snippet}Semi Design Light Tag
  </Tag>
  <Tag color="cyan" size="large" shape="circle" type="light">
    {#snippet suffixIcon()}<IconSemiLogo />{/snippet}D2C: figma to code in one click
  </Tag>
  <Tag color="light-blue" size="large" shape="circle" type="ghost">
    {#snippet prefixIcon()}<IconGithubLogo />{/snippet}Semi Design Ghost Tag
  </Tag>
  <Tag color="cyan" size="large" shape="circle" type="ghost">
    {#snippet suffixIcon()}<IconSemiLogo />{/snippet}D2C: figma to code in one click
  </Tag>
  <Tag color="light-blue" size="large" shape="circle" type="solid">
    {#snippet prefixIcon()}<IconGithubLogo />{/snippet}Semi Design Solid Tag
  </Tag>
  <Tag color="cyan" size="large" shape="circle" type="solid">
    {#snippet suffixIcon()}<IconSemiLogo />{/snippet}D2C: figma to code in one click
  </Tag>
</Space>
