<!--
  Switch 视觉回归 fixture：开（value=true）/ 关（value=false）两态。
  Switch 用 value 控制开关，非 checked。仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Switch } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:16px; padding:16px; background:#fff; align-items:center;"
  >
    <Switch value={true} aria-label="on" />
    <Switch value={false} aria-label="off" />
  </div>
</LocaleProvider>
