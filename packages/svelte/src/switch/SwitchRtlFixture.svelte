<!--
  browser project 夹具（真实 chromium）：Switch 在 LTR / RTL 两种书写方向下的 knob 几何。

  为什么必须在真实浏览器：RTL 镜像的正确性只体现在**真实布局坐标**上
  （knob 距轨道左右边缘的距离），jsdom 无布局、getBoundingClientRect 恒 0，测不出来。
  `.cd-rtl` 作用域由 ConfigProvider direction='rtl' 注入，与 Semi `.semi-rtl` 同构。
-->
<script lang="ts">
  // ⚠️ browser project 不会自动带上 token 变量：不引这行则 var(--cd-*) 全失效，
  // 轨道/knob 尺寸塌成 0，左右距离恒为 0、断言恒真（见 browser-project-needs-tokens-css-import）。
  import '@chenzy-design/tokens/tokens.css';
  import Switch from './Switch.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<!-- 用例按容器 + 出现顺序取（off, on），故此处顺序不可调换。
     Switch 不透传 data-* 属性，标识挂在外层容器上。 -->
<div data-testid="ltr">
  <Switch />
  <Switch defaultChecked={true} />
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl">
    <Switch />
    <Switch defaultChecked={true} />
  </div>
</ConfigProvider>
