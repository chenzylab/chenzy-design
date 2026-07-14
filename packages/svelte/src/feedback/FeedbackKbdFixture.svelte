<!--
  仅供 Feedback.kbd.test.ts（browser project）使用的键盘 e2e 夹具。
  对齐 Semi 后 emoji 评分行为裸 span（本库补 role=button + Enter/Space 触发），
  真浏览器验证键盘可达性与真实焦点。onValueChange 回写供断言。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Feedback from './Feedback.svelte';
  import type { FeedbackValue } from './Feedback.svelte';

  let last = $state<FeedbackValue | null>(null);
</script>

<LocaleProvider locale="en_US">
  <Feedback
    visible
    mode="modal"
    type="emoji"
    title="Feedback"
    onValueChange={(v: FeedbackValue) => (last = v)}
  />
</LocaleProvider>

<span data-testid="last-emoji">{last && typeof last === 'object' && !Array.isArray(last) ? (last.emoji ?? '') : ''}</span>
