<!--
  Input 视觉回归 fixture：默认（带占位符）+ disabled 两态。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Input } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:16px; padding:16px; background:#fff; align-items:center;"
  >
    <Input placeholder="Default" ariaLabel="default" />
    <Input placeholder="Disabled" disabled ariaLabel="disabled" />
  </div>
</LocaleProvider>
