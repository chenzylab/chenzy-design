<!--
  Tag 视觉回归 fixture：light / solid / ghost 三种 type（primary 色）。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Tag } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:12px; padding:16px; background:#fff; align-items:center;"
  >
    <Tag type="light" color="primary">Light</Tag>
    <Tag type="solid" color="primary">Solid</Tag>
    <Tag type="ghost" color="primary">Ghost</Tag>
  </div>
</LocaleProvider>
