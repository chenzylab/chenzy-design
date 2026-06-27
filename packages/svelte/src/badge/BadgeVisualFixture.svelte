<!--
  Badge 视觉回归 fixture：带数字角标（count），挂在一个占位方块右上角。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Badge } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:24px; padding:20px; background:#fff; align-items:center;"
  >
    <Badge count={5}>
      <div style="width:40px; height:40px; border-radius:6px; background:#e0e0e0;"></div>
    </Badge>
    <Badge count={128}>
      <div style="width:40px; height:40px; border-radius:6px; background:#e0e0e0;"></div>
    </Badge>
  </div>
</LocaleProvider>
