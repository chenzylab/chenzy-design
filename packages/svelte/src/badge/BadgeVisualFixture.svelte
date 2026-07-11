<!--
  Badge 视觉回归 fixture：覆盖 count/overflow、dot、type、theme 各形态。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Badge } from './index.js';
</script>

{#snippet box()}
  <div style="width:40px; height:40px; border-radius:6px; background:#e0e0e0;"></div>
{/snippet}

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:24px; padding:20px; background:#fff; align-items:center;"
  >
    <Badge count={5}>{@render box()}</Badge>
    <Badge count={128}>{@render box()}</Badge>
    <Badge dot>{@render box()}</Badge>
    <Badge count={5} type="primary">{@render box()}</Badge>
    <Badge count={5} type="success" theme="light">{@render box()}</Badge>
    <Badge count={5} type="warning" theme="inverted">{@render box()}</Badge>
  </div>
</LocaleProvider>
