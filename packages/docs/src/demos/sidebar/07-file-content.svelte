<script lang="ts">
  import {
    SideBarContainer,
    SideBar,
    SideBarFileContent,
    Button,
    type FileItemProps,
  } from '@chenzy-design/svelte';

  let visible = $state(false);
  let activeKey = $state<string[]>(['readme']);

  const files: FileItemProps[] = [
    {
      key: 'readme',
      name: 'README.md（可编辑）',
      editable: true,
      content:
        '<h2>chenzy-design</h2><p>一个基于 <strong>Svelte 5</strong> 的组件库。</p><ul><li>运行时 CSS 变量主题</li><li>无障碍增强</li></ul>',
      onContentChange: (html) => console.log('changed', html),
    },
    {
      key: 'notes',
      name: 'notes.html（只读）',
      content:
        '<p>这是<em>只读</em>富文本，展示 <a href="https://example.com">链接</a> 与 <code>行内代码</code>。</p><blockquote>引用块示例。</blockquote>',
    },
  ];
</script>

<Button onclick={() => (visible = true)}>打开富文本查看/编辑</Button>

<SideBarContainer {visible} title="文件内容" onCancel={() => (visible = false)}>
  <SideBar mode="main" renderMainContent={mainContent} />
</SideBarContainer>

{#snippet mainContent()}
  <SideBarFileContent
    {files}
    {activeKey}
    onChange={(keys) => (activeKey = keys)}
    onExpand={(_e, file) => console.log('expand', file.key)}
  />
{/snippet}
