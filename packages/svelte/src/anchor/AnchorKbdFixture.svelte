<!--
  仅供 Anchor.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  链接列表为单一 Tab 停靠点（roving，真实焦点）。带对应 section 目标。
  前后各放按钮验证 Tab 进入只停靠单个链接、Tab 出去落到 after。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Anchor from './Anchor.svelte';

  const links = [
    { key: 'one', href: '#sec-one', title: 'Section One' },
    { key: 'two', href: '#sec-two', title: 'Section Two' },
    { key: 'three', href: '#sec-three', title: 'Section Three' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Anchor {links} ariaLabel="On this page" />
  <button type="button" data-testid="after">after</button>
  <section id="sec-one">one</section>
  <section id="sec-two">two</section>
  <section id="sec-three">three</section>
</LocaleProvider>
