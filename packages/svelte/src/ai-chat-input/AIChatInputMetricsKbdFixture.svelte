<!--
  browser project 夹具（真实 chromium）：给附件卡片 / 技能项 / 建议项做 computed 度量。

  必须真实浏览器：这些值全是 var(--cd-*) token 解析后的结果，jsdom 不解析自定义属性。
  必须引 tokens.css：不引则 var() 全失效、宽高恒 0，断言恒真测不出回归
  （见 browser-project-needs-tokens-css-import）。

  附件走 uploadProps.defaultFileList 注入（对齐 Semi 的 defaultAttachment 取值路径），
  免去真实上传；技能/建议面板由夹具直接常开渲染子组件，避免依赖 tiptap 触发时序。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import AIChatInput from './AIChatInput.svelte';
  import AIChatInputSkillItem from './AIChatInputSkillItem.svelte';
  import AIChatInputSuggestionItem from './AIChatInputSuggestionItem.svelte';

  const uploadProps = {
    defaultFileList: [{ uid: 'a1', name: 'spec.docx', size: '12KB', status: 'success' }],
  };
</script>

<div data-testid="attachment-host">
  <AIChatInput {uploadProps} />
</div>

<!-- 技能/建议项单独挂载：只验样式，不依赖面板弹出时序。 -->
<div data-testid="skill-host">
  <AIChatInputSkillItem
    skill={{ value: 'summarize', label: '总结' }}
    index={0}
    onClick={() => {}}
    onMouseEnter={() => {}}
  />
</div>

<div data-testid="suggestion-host">
  <AIChatInputSuggestionItem
    suggestion="帮我写一段文案"
    index={0}
    onClick={() => {}}
    onMouseEnter={() => {}}
  />
</div>
