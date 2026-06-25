<!--
  仅供 Rating.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Rating 根元素是 role=slider（tabindex=0），焦点落在根上：
  方向键调评分、数字键 1–9 定位、Home/End 到 0/count，aria-valuenow 真实变化。
  before 按钮验证 Tab 真实聚焦到 slider 根。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Rating from './Rating.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Rating defaultValue={3} count={5} ariaLabel="Score" />
</LocaleProvider>
