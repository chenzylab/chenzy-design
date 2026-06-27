<!--
  Button 视觉回归 fixture：一张图覆盖 primary / secondary / danger 三种 type。
  外层 LocaleProvider 让组件内置文案稳定；固定内边距/间距让截图边界可复现。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Button } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:12px; padding:16px; background:#fff; align-items:center;"
  >
    <Button type="primary">Primary</Button>
    <Button type="secondary">Secondary</Button>
    <Button type="danger">Danger</Button>
  </div>
</LocaleProvider>
