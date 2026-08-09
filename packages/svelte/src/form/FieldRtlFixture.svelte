<!--
  browser project 夹具（真实 chromium）：Form.Field 在 LTR / RTL 下的真实布局。
  覆盖两处逻辑属性镜像：x-label-pos=left 时 label 的 margin-inline-end（视觉 margin-right
  → RTL margin-left）、错误状态图标的 margin-inline-end。全部走 CSS 逻辑属性零 override
  （无 .cd-rtl 覆盖块），此夹具验证浏览器按 direction 自动镜像的效果与 Semi rtl.scss
  手动镜像后的结果等价。为什么必须真实浏览器：见 ButtonRtlFixture 同理。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import { Form } from './index.js';
  import ConfigProvider from '../config-provider/ConfigProvider.svelte';
</script>

<div data-testid="ltr">
  <Form initValues={{ name: '' }} labelPosition="left">
    {#snippet children()}
      <Form.Input field="name" label="Name" rules={[{ required: true }]} validateStatus="error" helpText="required" />
    {/snippet}
  </Form>
</div>

<ConfigProvider direction="rtl">
  <div data-testid="rtl">
    <Form initValues={{ name: '' }} labelPosition="left">
      {#snippet children()}
        <Form.Input field="name" label="Name" rules={[{ required: true }]} validateStatus="error" helpText="required" />
      {/snippet}
    </Form>
  </div>
</ConfigProvider>
