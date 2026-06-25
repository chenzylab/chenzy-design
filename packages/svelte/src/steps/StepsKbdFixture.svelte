<!--
  仅供 Steps.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  type="nav" 启用 clickable，可点击步骤组为单一 Tab 停靠点（roving，真实焦点）。
  前后各放一个按钮，验证 Tab 从 before 进入只停靠单一步骤、Tab 出去落到 after。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Steps from './Steps.svelte';

  const steps = [
    { title: 'First' },
    { title: 'Second' },
    { title: 'Third' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Steps {steps} type="nav" defaultCurrent={0} />
  <button type="button" data-testid="after">after</button>
</LocaleProvider>
