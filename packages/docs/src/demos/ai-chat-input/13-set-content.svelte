<script lang="ts">
  // 严格对齐 Semi「SetContent」demo：挂载后先 setContent 插入含 skill-slot 的内容，
  // 1 秒后用 setContentWhileSaveTool（保留当前技能 chip，只改正文）改变内容；
  // 按钮查看 getEditor().getHTML()/getJSON()。
  import { AIChatInput, Button } from '@chenzy-design/svelte';
  import type { AIChatInputChangePayload, AIChatInputSkill } from '@chenzy-design/svelte';

  let chatInputRef = $state<{
    setContent: (c: string) => void;
    setContentWhileSaveTool: (c: string) => void;
    getEditor: () => { getHTML: () => string; getJSON: () => unknown } | undefined;
  }>();
  let lastHtml = $state('');
  let lastJson = $state('');

  function onContentChange(payload: AIChatInputChangePayload): void {
    console.log('onContentChange', payload);
  }

  function onSkillChange(skill: AIChatInputSkill | undefined): void {
    console.log('skill', skill);
  }

  $effect(() => {
    chatInputRef?.setContent(
      '<skill-slot data-label="AI 写代码" data-value="AI coding" data-template=true></skill-slot>帮我完成...',
    );
    const timer = setTimeout(() => {
      chatInputRef?.setContentWhileSaveTool('改变后的内容');
    }, 1000);
    return () => clearTimeout(timer);
  });

  function onCheck(): void {
    const editor = chatInputRef?.getEditor();
    lastHtml = editor?.getHTML() ?? '';
    lastJson = JSON.stringify(editor?.getJSON() ?? {});
    console.log('html', lastHtml);
    console.log('json', lastJson);
  }
</script>

<div style="margin: 12px; max-width: 560px;">
  <AIChatInput
    bind:this={chatInputRef}
    placeholder="输入内容或者上传内容"
    {onSkillChange}
    {onContentChange}
  />
  <br />
  <Button onclick={onCheck}>点我查看富文本区域内容</Button>
  {#if lastHtml}
    <p style="margin-top: 12px; color: var(--cd-color-text-2); word-break: break-all;">
      html：{lastHtml}
    </p>
  {/if}
</div>
