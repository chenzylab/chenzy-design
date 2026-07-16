<!--
  仅供 Rating.kbd.test.ts（browser project）使用的键盘 e2e 夹具（对齐 Semi）。
  每颗星 role=radio（roving tabindex），焦点落在当前分值对应的星上；
  方向键调评分（→/↑ 加、←/↓ 减）并搬移焦点，aria-checked 真实变化。
  before 按钮验证 Tab 真实聚焦到当前 radio 星。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Rating from './Rating.svelte';
</script>

<LocaleProvider locale="en_US">
  <button type="button" data-testid="before">before</button>
  <Rating defaultValue={3} count={5} aria-label="Score" />
</LocaleProvider>
