<!--
  Anchor.a11y.test 用：多级嵌套组合式夹具。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Anchor } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <Anchor>
    <Anchor.Link href="#a" title="A">
      <Anchor.Link href="#a1" title="A1" />
    </Anchor.Link>
  </Anchor>
</LocaleProvider>
