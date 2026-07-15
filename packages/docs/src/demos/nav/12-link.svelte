<script lang="ts">
  import { Nav } from '@chenzy-design/svelte';

  // 原生链接导航：叶子项用 link + linkOptions 渲染为 <a href>，
  // 头部也用 link/linkOptions。对齐 Semi LinkNav story。
  // 用外部 href（https://…）+ target=_blank，避免站内相对路径被预渲染爬取而 404。
  const items = [
    {
      itemKey: 'docs',
      text: '组件文档',
      icon: iconBook,
      link: 'https://chenzy.design',
      linkOptions: { target: '_blank', rel: 'noopener noreferrer' },
    },
    {
      itemKey: 'github',
      text: '源码仓库',
      icon: iconCode,
      link: 'https://github.com',
      linkOptions: { target: '_blank', rel: 'noopener noreferrer' },
    },
    {
      itemKey: 'resource',
      text: '设计资源',
      icon: iconStar,
      items: [
        {
          itemKey: 'figma',
          text: 'Figma',
          link: 'https://figma.com',
          linkOptions: { target: '_blank', rel: 'noopener noreferrer' },
        },
        {
          itemKey: 'icons',
          text: '图标库',
          link: 'https://github.com',
          linkOptions: { target: '_blank', rel: 'noopener noreferrer' },
        },
      ],
    },
  ];
</script>

{#snippet logo()}
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
    <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" opacity="0.55" />
    <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--cd-color-primary, #0064fa)" />
  </svg>
{/snippet}
{#snippet iconBook()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
{/snippet}
{#snippet iconCode()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
{/snippet}
{#snippet iconStar()}
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
{/snippet}

<div style="width: 240px; height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: hidden;">
  <Nav
    mode="vertical"
    defaultSelectedKeys={['docs']}
    defaultOpenKeys={['resource']}
    {items}
    header={{
      logo,
      text: 'chenzy-design',
      link: 'https://chenzy.design',
      linkOptions: { target: '_blank', rel: 'noopener noreferrer' },
    }}
    style="height: 100%;"
  />
</div>
