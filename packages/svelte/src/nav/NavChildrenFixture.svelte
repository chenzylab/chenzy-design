<!--
  测试夹具：items + 任意 children 并存（对齐 Semi navigation/index.tsx 的
  `<ul>{itemElems}{children}</ul>`——非 Nav.Item 的子内容原样渲染在列表内、items 之后）。
-->
<script lang="ts">
  import Nav from './Nav.svelte';
</script>

<Nav mode="horizontal" items={[{ itemKey: 'home', text: '首页' }]}>
  <span data-testid="free-content">模版推荐</span>
</Nav>
