<!--
  仅供 Anchor.a11y.test.ts（dom project）使用的声明式 <Anchor.Link> 夹具。
  验证：声明式子组件按 DOM 顺序 + 嵌套层级注册渲染，disabled 链接排除 roving，
  且不触发 Svelte5 自循环（effect_update_depth_exceeded）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Anchor } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <Anchor ariaLabel="On this page">
    <Anchor.Link href="#guide" title="Guide">
      <Anchor.Link href="#install" title="Install" />
      <Anchor.Link href="#usage" title="Usage" />
    </Anchor.Link>
    <Anchor.Link href="#api" title="API" />
    <Anchor.Link href="#faq" title="FAQ" disabled />
  </Anchor>
</LocaleProvider>
