<!--
  Spin a11y 测试夹具：不注入 children，使 inline 形态生效。
  （renderWithLocale 的 harness 恒注入空 children snippet，会让 Spin 走 wrapper 形态。）
  自带 LocaleProvider，故测试直接 render 本夹具。
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
