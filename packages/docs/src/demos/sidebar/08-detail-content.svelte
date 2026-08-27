<script lang="ts">
  // 对齐 Semi「侧边信息栏」：主视图 + 详情视图（mode='code' / 'file'）。
  // 详情内容**不传 renderDetailContent**，改传 detailContent —— 走 SideBar 内置渲染：
  //   mode='code' → CodeHighlight / JsonViewer（按 isJson 分流）
  //   mode='file' → 可编辑富文本（fileEditable / onFileContentChange），
  //     imgUploadProps 透传内置富文本的图片上传节点（对齐 Semi md 1338 行 <Sidebar imgUploadProps>，
  //     与 SideBarFileItem.imgUploadProps 是不同的消费点：这里走 SideBar 内置详情渲染路径）。
  // 详情头由组件内置渲染：返回按钮 + detailContent.name + 复制按钮（onDetailContentCopy）。
  import { SideBarContainer, SideBar, Button } from '@chenzy-design/svelte';
  import type { SideBarImageUploadOptions } from '@chenzy-design/svelte';

  let visible = $state(false);
  let mode = $state<'main' | 'code' | 'file'>('main');
  let copied = $state('');
  let fileContent = $state('<h3>项目说明</h3><p>这是一段<strong>可编辑</strong>的富文本内容。</p>');

  const codeDetail = {
    key: 'code-1',
    name: 'tool_call.json',
    isJson: true,
    content: JSON.stringify({ name: 'search_web', arguments: { query: 'Svelte 5 runes' } }, null, 2),
  };

  const fileDetail = $derived({
    key: 'file-1',
    name: 'README.md',
    content: fileContent,
  });

  const detail = $derived(mode === 'file' ? fileDetail : codeDetail);

  const imgUploadProps: SideBarImageUploadOptions = {
    action: 'https://api.example.com/upload',
    getUploadImageSrc: () =>
      'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/dy.png',
  };
</script>

<Button onclick={() => (visible = true)}>打开内置详情渲染</Button>

<SideBarContainer {visible} title="信息栏" onCancel={() => (visible = false)}>
  <SideBar
    {mode}
    detailContent={detail}
    fileEditable
    {imgUploadProps}
    onFileContentChange={(html) => (fileContent = html)}
    onDetailContentCopy={(_e, _content, res) => (copied = res ? '已复制' : '复制失败')}
    onBackWard={() => {
      mode = 'main';
      copied = '';
    }}
    renderMainContent={mainContent}
  />
</SideBarContainer>

{#snippet mainContent()}
  <div style="padding: 4px 0; display: flex; flex-direction: column; gap: 8px; align-items: flex-start;">
    <p>不传 renderDetailContent 时，详情区由组件按 mode 内置渲染；富文本详情支持 imgUploadProps 图片上传。</p>
    <Button size="small" onclick={() => (mode = 'code')}>查看代码详情（JSON）</Button>
    <Button size="small" onclick={() => (mode = 'file')}>查看富文本详情（可编辑，可插入图片）</Button>
    {#if copied}<span style="color: var(--cd-color-success);">{copied}</span>{/if}
  </div>
{/snippet}
