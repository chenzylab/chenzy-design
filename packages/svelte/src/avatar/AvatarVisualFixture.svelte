<!--
  Avatar 视觉回归 fixture（对齐 Semi）：覆盖形状、尺寸、语义色、额外边框。
  用文字头像避免外部图片加载影响截图稳定。仅用于 visual 测试，不对外导出。
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
    <Avatar shape="circle" color="blue">CZ</Avatar>
    <Avatar shape="square" color="teal">CZ</Avatar>
    <Avatar size="small" color="red">U</Avatar>
    <Avatar size="large" color="amber">U</Avatar>
    <Avatar color="violet" border>B</Avatar>
  </div>
</LocaleProvider>
