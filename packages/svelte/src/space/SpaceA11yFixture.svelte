<!--
  仅供 Space.a11y.test.ts 使用的测试夹具：Space 间距容器包裹若干子元素。
  纯布局容器，不引入语义；本套件只断言 axe 0 violations。
-->
<script lang="ts">
  import Space from './Space.svelte';

  interface Props {
    direction?: 'horizontal' | 'vertical';
  }
  let { direction = 'horizontal' }: Props = $props();
</script>

<Space {direction}>
  <button type="button">First</button>
  <button type="button">Second</button>
</Space>
