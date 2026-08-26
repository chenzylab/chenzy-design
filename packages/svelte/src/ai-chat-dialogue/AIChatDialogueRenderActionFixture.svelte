<!--
  测试夹具：给 AIChatDialogue 传 dialogueRenderConfig.renderDialogueAction，
  捕获 defaultActionsObj 的键集合与 defaultActions 数组长度，供单测断言
  （对齐 Semi RenderActionProps.defaultActionsObj / defaultActions 契约）。仅测试用，不导出。
-->
<script lang="ts">
  import AIChatDialogue from './AIChatDialogue.svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';
  import type { RenderActionProps } from './render-config.js';

  interface Props {
    chats: AIDialogueMessage[];
    roleConfig: AIDialogueRoleConfig;
    onCapture: (keys: string[], actionsLength: number) => void;
  }
  let { chats, roleConfig, onCapture }: Props = $props();
</script>

<AIChatDialogue {chats} {roleConfig} dialogueRenderConfig={{ renderDialogueAction: captureAction }} />

{#snippet captureAction({ className, defaultActions, defaultActionsObj }: RenderActionProps)}
  {@const _ = onCapture(Object.keys(defaultActionsObj), defaultActions.length)}
  <div class={className}></div>
{/snippet}
