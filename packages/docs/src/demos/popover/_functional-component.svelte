<!-- 函数式组件作为 Popover children：Svelte 中无需 forwardRef，
     组件只需渲染出真实 DOM 元素，Popover 以包裹 span 承载事件与定位。 -->
<script lang="ts">
  let { style = '' }: { style?: string } = $props();
</script>

<span {style}>Functional Component</span>
