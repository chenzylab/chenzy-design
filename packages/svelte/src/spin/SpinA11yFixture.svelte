<!--
  Spin a11y 测试夹具：自带 LocaleProvider，故测试直接 render 本夹具。
  Semi 统一 DOM 无形态分叉；loading 时 .cd-spin-wrapper 承载 role=status。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Spin from './Spin.svelte';

  interface Props {
    props?: Record<string, unknown>;
  }
  let { props = {} }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <Spin {...props} />
</LocaleProvider>
