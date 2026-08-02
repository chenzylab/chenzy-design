<!--
  browser project 夹具（真实 chromium、标签可见）：验证 SideBar 内置详情渲染
  （detailContent 路径，对齐 Semi renderDetail / renderHeader）。
  为什么必须在真实浏览器：`navigator.clipboard.writeText` 要求**文档处于聚焦态**，
  CDP 后台标签（document.hidden）下必抛 `NotAllowedError: Document is not focused`，
  真机联调判不了真。
-->
<script lang="ts">
  import SideBar from './SideBar.svelte';

  let copyResult = $state('');
  const detailContent = {
    key: 'code-1',
    name: 'tool_call.json',
    isJson: true,
    content: '{"name":"search_web"}',
  };
</script>

<SideBar
  mode="code"
  {detailContent}
  onDetailContentCopy={(_e, content, res) => (copyResult = `${res}:${content}`)}
/>
<output data-testid="copy-result">{copyResult}</output>
