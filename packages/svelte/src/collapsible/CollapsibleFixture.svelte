<!--
  Collapsible a11y/render 夹具：把 Collapsible 包一层并注入可见内容 children，
  供 jsdom 渲染测试断言 aria-hidden / shouldRender（内容 DOM 存留）/ onMotionEnd 等。
-->
<script lang="ts">
  import Collapsible from './Collapsible.svelte';

  interface Props {
    isOpen?: boolean;
    duration?: number;
    motion?: boolean;
    keepDOM?: boolean;
    lazyRender?: boolean;
    collapseHeight?: number;
    collapseHeightAdaptive?: boolean;
    fade?: boolean;
    reCalcKey?: number | string;
    id?: string;
    onMotionEnd?: () => void;
  }

  let { ...rest }: Props = $props();
</script>

<Collapsible {...rest}>
  <p data-testid="content">折叠内容 collapsible content</p>
</Collapsible>
