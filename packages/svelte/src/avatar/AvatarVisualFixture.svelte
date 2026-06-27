<!--
  Avatar 视觉回归 fixture：圆形 + 方形（文字头像，避免外部图片加载影响截图稳定）。
  仅用于 visual 测试，不对外导出。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Avatar } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <div
    data-visual-root
    style="display:inline-flex; gap:16px; padding:16px; background:#fff; align-items:center;"
  >
    <Avatar shape="circle">CZ</Avatar>
    <Avatar shape="square">CZ</Avatar>
  </div>
</LocaleProvider>
