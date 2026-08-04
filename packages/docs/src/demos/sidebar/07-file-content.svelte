<script lang="ts">
  // 对齐 Semi「富文本编辑器」段：用 SideBarFileItem 查看/编辑单条富文本内容
  // （基于 tiptap），配合按钮切换 editable。
  import { SideBarFileItem, Button } from '@chenzy-design/svelte';

  const defaultContent = `<h2>chenzy-design 介绍</h2>
<p>chenzy-design 是一个基于 <strong>Svelte 5</strong> 的组件库，严格对齐 <em>Semi Design</em> 的设计与交互规范。</p>
<ul>
  <li>设计简洁、现代化</li>
  <li>提供主题方案，可深度样式定制</li>
</ul>
<p>组件基于原生 DOM API 实现，无第三方 UI 依赖。</p>`;

  let editable = $state(true);
  let content = $state(defaultContent);
</script>

<Button onclick={() => (editable = !editable)}>是否可编辑：{editable ? '是' : '否'}</Button>
<br /><br />
<SideBarFileItem
  {content}
  onContentChange={(html) => (content = html)}
  {editable}
  style="border: 1px solid var(--cd-color-border); padding: 12px;"
/>
