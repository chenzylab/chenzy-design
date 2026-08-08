<!--
  browser project 夹具（真实 chromium）：验证 showPlaceholderWhenSkillOnly。
  为什么必须真实浏览器：tiptap 编辑器需真实 DOM 挂载 + ProseMirror decoration 生效，
  jsdom 跑不起来；且 placeholder 是 CSS ::before/::after 伪元素，需 computed style 才能读。
  左右两个实例分别开/关该 prop，用于对照。
-->
<script lang="ts">
  import '@chenzy-design/tokens/tokens.css';
  import AIChatInput from './AIChatInput.svelte';

  const skills = [{ value: 'translate', label: '翻译' }];
</script>

<div data-testid="on">
  <AIChatInput placeholder="输入消息" {skills} showPlaceholderWhenSkillOnly />
</div>

<div data-testid="off">
  <AIChatInput placeholder="输入消息" {skills} />
</div>
