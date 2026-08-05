<!--
  browser project 夹具（真实 chromium）：Button 系列在 LTR / RTL 下的真实布局。
  覆盖三处物理属性镜像：icon-only padding、ButtonGroup outline 叠边、ButtonGroup 首末圆角。
  为什么必须真实浏览器：见 SwitchRtlFixture 同理，jsdom 无布局、getBoundingClientRect 恒 0。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

{#snippet dot()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
{/snippet}

<div data-testid="ltr">
  <Button icon={dot} aria-label="icon-only" />
  <ButtonGroup theme="outline" aria-label="outline-group">
    <Button>A</Button>
    <Button>B</Button>
    <Button>C</Button>
  </ButtonGroup>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl">
    <Button icon={dot} aria-label="icon-only" />
    <ButtonGroup theme="outline" aria-label="outline-group">
      <Button>A</Button>
      <Button>B</Button>
      <Button>C</Button>
    </ButtonGroup>
  </div>
</ConfigProvider>
