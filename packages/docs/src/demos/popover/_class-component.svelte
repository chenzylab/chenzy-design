<!-- 另一种自定义组件写法（对齐 Semi 的 ClassComponent）：同样只需渲染出真实 DOM，
     属性可透传至底层 DOM 节点即可作为 Popover children。 -->
<script lang="ts">
  let { style = '' }: { style?: string } = $props();
</script>

<span {style}>ClassComponent</span>
