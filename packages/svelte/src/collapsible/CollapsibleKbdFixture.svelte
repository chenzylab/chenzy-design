<!--
  browser project 夹具（真实 chromium、标签可见）：复刻 docs collapsible 基本用法 demo ——
  Toggle 按钮 + Collapsible 包裹一段定高内容。
  用途：jsdom 测不了真实布局高度，而 CDP 后台标签（document.hidden）下 ResizeObserver
  被浏览器冻结、wrapper 高度恒 0（见 md FAQ 与 [[resizeobserver-frozen-in-hidden-tab]]），
  真机联调无法判真。放到 browser project 里断言展开后 wrapper 真的被撑开、收起后归零。
-->
<script lang="ts">
  import Collapsible from './Collapsible.svelte';

  let isOpen = $state(false);
</script>

<!--
  用默认 duration（250ms）而非 0：duration=0 且 motion=true 时 0ms 过渡不派发
  transitionend，visible 便不会翻 false（收起后内容不卸载）。这与 Semi 完全同构
  （semi-ui/collapsible/index.tsx:133/137/186 同款逻辑），属该组合的固有行为，
  非缺陷；demo 走默认时长，测试也照默认走。
-->
<button data-testid="toggle" onclick={() => (isOpen = !isOpen)}>Toggle</button>
<Collapsible {isOpen}>
  <div data-testid="content" style="height: 120px">折叠内容</div>
</Collapsible>
