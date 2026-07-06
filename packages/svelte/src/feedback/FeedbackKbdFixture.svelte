<!--
  仅供 Feedback.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  Feedback type=emoji 的评分行是 role=radiogroup + role=radio 子项（roving tabindex），
  方向键在 emoji 间移动并选中（aria-checked 真实变化），jsdom 测不了真实焦点/方向键。
  受控 value 由本夹具持有，onValueChange 回写，模拟真实使用。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Feedback from './Feedback.svelte';
  import type { FeedbackValue } from './Feedback.svelte';

  let value = $state<FeedbackValue>({});
</script>

<LocaleProvider locale="en_US">
  <Feedback
    open
    mode="modal"
    type="emoji"
    title="Feedback"
    {value}
    onValueChange={(v: FeedbackValue) => (value = v)}
  />
</LocaleProvider>
