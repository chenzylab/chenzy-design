<!--
  browser project 夹具（真实 chromium）：AvatarGroup 层叠方向在 LTR / RTL 下的镜像。

  起因：这批规则原本写成 `[dir='rtl']` 属性选择器，**从未生效** ——
  ConfigProvider 只注入 `class="cd-rtl"`，不设 dir 属性。
  本夹具钉住改用 `.cd-rtl` 后的真实层叠顺序。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import Avatar from './Avatar.svelte';
  import AvatarGroup from './AvatarGroup.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<div data-testid="ltr" style="width: 400px">
  <AvatarGroup>
    <Avatar>A</Avatar>
    <Avatar>B</Avatar>
    <Avatar>C</Avatar>
  </AvatarGroup>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl" style="width: 400px">
    <AvatarGroup>
      <Avatar>A</Avatar>
      <Avatar>B</Avatar>
      <Avatar>C</Avatar>
    </AvatarGroup>
  </div>
</ConfigProvider>
