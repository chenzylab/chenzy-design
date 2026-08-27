<script lang="ts">
  // 对齐 Semi「富文本列表」段：用 SideBarFileContent 直接展示富文本列表信息
  // （不套 SideBarContainer，独立可用）；activeKey/onChange 受控管理展开态。
  import { SideBarFileContent } from '@chenzy-design/svelte';
  import type { FileItemProps } from '@chenzy-design/svelte';

  // 数据照搬 Semi md defaultFiles（3 条：file1 同一段介绍重复 3 次的长文/file2 英文
  // 主题简介/file3 英文框架适配说明），段落结构与重复次数一致，文案替换为本库品牌。
  const introParagraph = `<p>
  chenzy-design 是由 <strong>chenzy</strong> 设计并维护的<em>组件库</em>。作为一个全面、易用、优质的现代前端组件解决方案，chenzy-design 基于 Svelte 5 构建，严格对齐 Semi Design 的设计与交互规范，详情见 https://chenzy.design/。chenzy-design 的特点包括：
</p>
<ul>
  <li>
    设计简洁、现代化。
  </li>
  <li>
    提供主题方案，可深度样式定制。
  </li>
</ul>
<p>
  组件基于原生 DOM API 实现，无第三方 UI 依赖，Svelte 5 编译产物体积小，运行时无虚拟 DOM 开销。
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  采用 Foundation 和 Adapter 跨框架技术方案，方便扩展。
</p>
<blockquote>
  chenzy-design 是由 chenzy 设计并维护的组件库
  <br />
  — chenzy-design
</blockquote>`;

  const introContent = `
<h2>
  chenzy-design 介绍
</h2>
${introParagraph}
${introParagraph}
${introParagraph}
`;

  const files: FileItemProps[] = [
    {
      key: 'file1',
      name: 'chenzy-design 介绍',
      content: introContent,
    },
    {
      key: 'file2',
      name: 'chenzy-design Theme',
      content: `<h2>
  chenzy-design Theme
</h2>
<p>chenzy-design Theme is a design token management capability provided by chenzy-design. It supports global and component-level style customization and keeps synchronization between design resources and front-end code. Suitable for teams of all sizes. Whether you need to simplify workflow, improve team collaboration, or increase productivity, we have features suitable for you.</p>
`,
    },
    {
      key: 'file3',
      name: 'Svelte 5 Adaptation',
      content: `<h2>
  Svelte 5 Adaptation
</h2>
<p>Svelte 5 introduces runes, a new set of primitives for reactivity, along with numerous compiler and API changes. To ensure chenzy-design is built entirely on the latest reactivity model, all components are authored with Svelte 5 runes from the ground up, and we do not provide a Svelte 4 compatibility package.
Installation & Usage
Install @chenzy-design/svelte and its peer dependency svelte@^5 to get started.</p>
`,
    },
  ];

  let activeKey = $state<string[]>(['file1']);
</script>

<SideBarFileContent {files} {activeKey} onChange={(keys) => (activeKey = keys)} />
