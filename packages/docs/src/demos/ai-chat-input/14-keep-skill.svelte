<script lang="ts">
  // 严格对齐 Semi「KeepSkill」demo：keepSkillAfterSend 开启后，generating 从 false→true
  // 清空输入时会保留已选技能标记（走 setContentWhileSaveTool 而非整体 clearContent）。
  import { AIChatInput, Button } from '@chenzy-design/svelte';
  import type { AIChatInputChangePayload, AIChatInputMessageContent } from '@chenzy-design/svelte';

  let chatInputRef = $state<{
    getEditor: () => { getHTML: () => string; getJSON: () => unknown } | undefined;
  }>();
  let generating = $state(false);
  let lastHtml = $state('');

  function onContentChange(payload: AIChatInputChangePayload): void {
    console.log('onContentChange', payload);
  }

  function toggleGenerate(_message?: AIChatInputMessageContent): void {
    generating = !generating;
  }

  function onCheck(): void {
    const editor = chatInputRef?.getEditor();
    lastHtml = editor?.getHTML() ?? '';
    console.log('html', lastHtml);
    console.log('json', editor?.getJSON());
  }
</script>

<div style="margin: 12px; max-width: 560px;">
  <AIChatInput
    bind:this={chatInputRef}
    {generating}
    keepSkillAfterSend
    defaultContent={`<skill-slot data-label="帮我写作" data-value="writing" data-template=true></skill-slot>帮我完成...`}
    placeholder="输入内容或者上传内容"
    {onContentChange}
    onMessageSend={toggleGenerate}
    onStopGenerate={toggleGenerate}
  />
  <br />
  <Button onclick={onCheck}>点击获取</Button>
  {#if lastHtml}
    <p style="margin-top: 12px; color: var(--cd-color-text-2); word-break: break-all;">
      html：{lastHtml}
    </p>
  {/if}
</div>
