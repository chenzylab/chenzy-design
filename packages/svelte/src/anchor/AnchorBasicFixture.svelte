<!--
  Anchor.a11y.test 用：基础组合式夹具（可选 defaultAnchor）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Anchor } from './index.js';

  let { defaultAnchor = '' }: { defaultAnchor?: string } = $props();
</script>

<LocaleProvider locale="en_US">
  <Anchor {defaultAnchor}>
    <Anchor.Link href="#intro" title="Intro" />
    <Anchor.Link href="#usage" title="Usage" />
  </Anchor>
</LocaleProvider>
