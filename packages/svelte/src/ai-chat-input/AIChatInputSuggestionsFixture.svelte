<!--
  测试夹具：验证 suggestions 变化即开/关建议面板（对齐 Semi componentDidUpdate）。
  按钮改的是传给 AIChatInput 的受控 prop，不碰组件内部状态。
-->
<script lang="ts">
  import AIChatInput from './AIChatInput.svelte';
  import type { AIChatInputSuggestion } from '@chenzy-design/core';

  let suggestions = $state<AIChatInputSuggestion[]>([]);
</script>

<button type="button" data-testid="fill" onclick={() => (suggestions = ['甲', '乙'])}>fill</button>
<button type="button" data-testid="clear" onclick={() => (suggestions = [])}>clear</button>

<AIChatInput {suggestions} placeholder="动态建议" />
