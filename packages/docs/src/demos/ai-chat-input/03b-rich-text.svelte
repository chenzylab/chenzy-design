<script lang="ts">
  // 严格对齐 Semi「富文本输入区」demo：三个内置 slot 的模版（input-slot / select-slot /
  // skill-slot），点击切换后经 ref 的 setContent 填入并 focusEditor。
  // 三段模版 HTML 与 Semi 逐字一致（标签名与属性名本库与 Semi 相同）。
  import { AIChatInput } from '@chenzy-design/svelte';

  const uploadProps = { action: 'https://api.semi.design/upload' };

  const temp: Record<string, string> = {
    'input-slot': '我是一个<input-slot placeholder="[职业]">程序员</input-slot>',
    'select-slot': `我是<select-slot value="前端开发" options='["设计","前端开发","后端开发"]'></select-slot>，帮我完成...`,
    'skill-slot': `<skill-slot data-label="AI Coding" data-value="AI Coding" data-template=false></skill-slot> 帮我完成...`,
  };
  const keys = Object.keys(temp);

  let activeIndex = $state(0);
  let ref = $state<{ setContent: (c: string) => void; focusEditor: () => void }>();

  function setTemplate(index: number): void {
    activeIndex = index;
    const content = temp[keys[index]!]!;
    ref?.setContent(content);
    ref?.focusEditor();
  }
</script>

<div style="margin: 12px;">
  <div class="aiChatInput-radio">
    {#each keys as key, index (key)}
      <button
        type="button"
        class="aiChatInput-radio-item"
        class:aiChatInput-radio-item-selected={index === activeIndex}
        onclick={() => setTemplate(index)}
      >
        {key}
      </button>
    {/each}
  </div>
  <AIChatInput
    bind:this={ref}
    defaultContent={temp['input-slot']}
    placeholder="输入内容或者上传内容"
    {uploadProps}
  />
</div>

<style>
  /* 对齐 Semi demo 里 aiChatInput-radio 的分段选择器观感（Semi 的样式在其站点全局 css 里，
     这里用本库 token 就地实现，不引入新组件）。 */
  .aiChatInput-radio {
    display: flex;
    column-gap: 8px;
    margin-bottom: 12px;
  }

  .aiChatInput-radio-item {
    appearance: none;
    border: 1px solid var(--cd-color-border);
    background: var(--cd-color-bg-0);
    color: var(--cd-color-text-1);
    border-radius: 6px;
    padding: 4px 12px;
    font-size: var(--cd-font-size-regular);
    line-height: 20px;
    cursor: pointer;
  }

  .aiChatInput-radio-item-selected {
    border-color: var(--cd-color-primary);
    color: var(--cd-color-primary);
    background: var(--cd-color-primary-light-default);
  }
</style>
