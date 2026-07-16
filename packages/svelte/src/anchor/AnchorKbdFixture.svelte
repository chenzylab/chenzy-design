<!--
  仅供 Anchor.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  链接列表为单一 Tab 停靠点（roving，真实焦点）。带对应 section 目标。
  前后各放按钮验证 Tab 进入只停靠单个链接、Tab 出去落到 after。
  组合式 API（对齐 Semi）：children + <Anchor.Link>。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import { Anchor } from './index.js';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Anchor aria-label="On this page">
    <Anchor.Link href="#sec-one" title="Section One" />
    <Anchor.Link href="#sec-two" title="Section Two" />
    <Anchor.Link href="#sec-three" title="Section Three" />
  </Anchor>
  <button type="button" data-testid="after">after</button>
  <section id="sec-one">one</section>
  <section id="sec-two">two</section>
  <section id="sec-three">three</section>
</LocaleProvider>
