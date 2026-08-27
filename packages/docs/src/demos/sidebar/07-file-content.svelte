<script lang="ts">
  // 对齐 Semi「富文本编辑器」段：用 SideBarFileItem 查看/编辑单条富文本内容
  // （基于 tiptap），配合按钮切换 editable；imgUploadProps 演示图片上传节点配置
  // （action 上传地址 + getUploadImageSrc 由响应派生最终 src，对齐 Semi 示例）。
  import { SideBarFileItem, Button } from '@chenzy-design/svelte';
  import type { SideBarImageUploadOptions } from '@chenzy-design/svelte';

  // 结构（h2/p/strong/em/ul/p/pre+code/p/blockquote）逐段照搬 Semi md
  // defaultFileContent，段落数量与长度一致，只替换品牌名/链接/组件库措辞。
  const defaultContent = `<h2>
  chenzy-design 介绍
</h2>
<p>
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

  let editable = $state(true);
  let content = $state(defaultContent);

  const imgUploadProps: SideBarImageUploadOptions = {
    action: 'https://api.example.com/upload',
    getUploadImageSrc: () => {
      // response 是 action 结果的返回值，此处仅为示例，实际使用时可从 response 取图片上传后的 src。
      return 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png';
    },
  };
</script>

<Button onclick={() => (editable = !editable)}>是否可编辑：{editable ? '是' : '否'}</Button>
<br /><br />
<SideBarFileItem
  {content}
  onContentChange={(html) => (content = html)}
  {editable}
  {imgUploadProps}
  style="border: 1px solid var(--cd-color-border); padding: 12px;"
/>
