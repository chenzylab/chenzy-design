<script lang="ts">
  import { SideBarAnnotation, Button } from '@chenzy-design/svelte';
  import type { SideBarAnnotationGroup } from '@chenzy-design/svelte';

  let visible = $state(false);
  let activeKey = $state<string[]>(['videos', 'articles']);

  const info: SideBarAnnotationGroup[] = [
    {
      header: '视频来源',
      key: 'videos',
      annotations: [
        {
          type: 'video',
          title: 'Svelte 5 Runes 深入讲解',
          url: 'https://svelte.dev',
          img: 'https://svelte.dev/favicon.png',
          logo: 'https://svelte.dev/favicon.png',
          siteName: 'YouTube',
          duration: 754,
          order: 1,
        },
      ],
    },
    {
      header: '文章来源',
      key: 'articles',
      annotations: [
        {
          type: 'text',
          title: 'Svelte 5 迁移指南',
          detail: '介绍 runes、事件属性、Snippet 等 Svelte 5 新范式与迁移路径。',
          url: 'https://svelte.dev/docs',
          logo: 'https://svelte.dev/favicon.png',
          siteName: 'svelte.dev',
          order: 2,
        },
        {
          type: 'text',
          title: 'WAI-ARIA Authoring Practices',
          detail: '无来源链接的纯文本引用（静态卡片，不可点击）。',
          order: 3,
        },
      ],
    },
  ];
</script>

<Button onclick={() => (visible = true)}>打开参考来源</Button>

<SideBarAnnotation
  {visible}
  {info}
  {activeKey}
  onCancel={() => (visible = false)}
  onChange={(keys) => (activeKey = keys)}
  onClick={(_e, item) => console.log('cite clicked:', item.title)}
/>
