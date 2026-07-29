<!--
  仅供 Select.kbd.test.ts 的尺寸回归用夹具（browser project / 真实 chromium 有真实布局，
  jsdom 量不到高度）。三档尺寸各渲染一个 Select，供测试量 getBoundingClientRect
  与 Semi 官网实测值（small 24 / default 32 / large 40）比对。

  夹具刻意复刻 docs 站的两个环境条件，缺一就测不出历史 bug：
    ① 全局 `*{box-sizing:border-box}` reset —— 否则量到的是 content-box 高度；
    ② 正文继承下来的 `line-height: 24.5px` —— 它撑开 content，把只写 min-block-size
       的小尺寸顶穿成 26.5px（真正的修复是给 .cd-select-content 定死 20px 行高）。
  browser project 没有 setupFiles，token 变量不会自动注入，故在此内联所需的三个高度 token
  （值取自 tokens.css 的 --cd-control-height-*；直接 import tokens.css 缺类型声明会断 typecheck）。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Select from './Select.svelte';

  const optionList = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
  ];
</script>

<div class="size-fixture">
  <LocaleProvider locale="en_US">
    <div data-testid="small"><Select {optionList} size="small" ariaLabel="Small" /></div>
    <div data-testid="default"><Select {optionList} ariaLabel="Default" /></div>
    <div data-testid="large"><Select {optionList} size="large" ariaLabel="Large" /></div>
  </LocaleProvider>
</div>

<style>
  .size-fixture {
    /* 与 tokens.css 同值：--cd-control-height-small/default/large = 24/32/40 */
    --cd-select-height-small: 24px;
    --cd-select-height-default: 32px;
    --cd-select-height-large: 40px;
    --cd-line-height-regular: 20px;
    /* docs 正文的继承行高，历史 bug 的触发条件 */
    line-height: 24.5px;
  }
  /* docs 站的全局 reset */
  .size-fixture :global(*),
  .size-fixture :global(*::before),
  .size-fixture :global(*::after) {
    box-sizing: border-box;
  }
</style>
