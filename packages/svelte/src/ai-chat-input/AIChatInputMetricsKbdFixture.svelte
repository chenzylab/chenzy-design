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

  // 单条引用：验 Semi 的 `:only-child { width: 100% }`。
  const references = [{ type: 'text', id: 'r1', content: '引用一段话' }];

  const threeReferences = [
    { type: 'text', id: 'r1', content: '引用一' },
    { type: 'text', id: 'r2', content: '引用二' },
    { type: 'text', id: 'r3', content: '引用三' },
  ];
</script>

<div data-testid="attachment-host">
  <AIChatInput {uploadProps} {references} />
</div>

<!-- 三条引用：验 Semi 的「3 条及以上各占 1/3」自适应列宽规则。 -->
<div data-testid="references-three-host">
  <AIChatInput references={threeReferences} showUploadFile={false} />
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

<!-- ⚠️ 必须真挂一次 InputSlotNode / SkillSlotNode：它们的样式写在各自组件的
     <style> 里（:global），而 Svelte 的组件样式是**随组件挂载才注入**的。
     只在下面摆裸 markup 的话，样式能否命中取决于本文件里是否恰好还有别的用例
     挂过这两个组件 —— 会变成用例顺序依赖（本轮已因此红过两次）。
     这两个 NodeView 需要 tiptap 的 node/editor 上下文，不能直接实例化，
     故改为把样式所需的最小结构 + 一次真实挂载都交给 AIChatInput：
     它内部注册了这两个扩展，编辑器一挂载，两份 :global 样式就都进文档了。 -->
<div data-testid="slot-style-host" style="position:absolute;left:-9999px;top:0;">
  <AIChatInput defaultContent={'<p><input-slot placeholder="x"></input-slot></p>'} />
</div>


<!-- 技能插槽视觉度量用（同 input-slot：不塞编辑器、不在用例里造裸节点）。 -->
<div data-testid="skill-slot-host">
  <span class="skill-slot-wrapper">
    <span class="skill-slot">
      总结
      <button type="button" class="skill-slot-delete">x</button>
    </span>
  </span>
</div>
