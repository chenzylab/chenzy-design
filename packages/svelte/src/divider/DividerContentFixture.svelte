<!-- 测试专用：注入 children snippet，验证带文字分支渲染。 -->
<script lang="ts">
  import Divider from './Divider.svelte';

  interface Props {
    align?: 'left' | 'center' | 'right';
    layout?: 'horizontal' | 'vertical';
  }

  let { align, layout }: Props = $props();
</script>

<Divider {align} {layout}>divider title</Divider>
