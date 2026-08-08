<script lang="ts">
  // 对齐 Semi「富文本列表」段：用 SideBarFileContent 直接展示富文本列表信息
  // （不套 SideBarContainer，独立可用）。第二项 editable 打开可编辑。
  import { SideBarFileContent } from '@chenzy-design/svelte';
  import type { FileItemProps } from '@chenzy-design/svelte';

  const files: FileItemProps[] = [
    {
      key: 'readme',
      name: 'README.md',
      content: '<h2>项目说明</h2><p>这是一段<strong>只读</strong>的富文本内容。</p>',
    },
    {
      key: 'draft',
      name: 'draft.md',
      editable: true,
      content: '<p>这一项 <em>可编辑</em>，聚焦后会出现格式工具栏。</p>',
    },
  ];
</script>

<SideBarFileContent {files} />
