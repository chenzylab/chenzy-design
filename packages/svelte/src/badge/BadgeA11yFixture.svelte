<!--
  Badge a11y 测试夹具：不注入 children，使独立状态点（standalone）形态生效。
  （renderWithLocale 的 harness 恒注入空 children snippet，会让 Badge 走 count 角标形态。）
  自带 LocaleProvider，故测试直接 render 本夹具。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Badge from './Badge.svelte';

  interface Props {
    props?: Record<string, unknown>;
  }
  let { props = {} }: Props = $props();
</script>

<LocaleProvider locale="en_US">
  <Badge {...props} />
</LocaleProvider>
