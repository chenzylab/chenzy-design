<!--
  测试夹具：验证 renderSkillItem / renderSuggestionItem 的「整项替换」语义（对齐 Semi）——
  自定义渲染必须拿到 className（含激活态）与 onClick / onMouseEnter，并自行渲染根节点。
-->
<script lang="ts">
  import AIChatInput from './AIChatInput.svelte';
  import type { AIChatInputSkill, AIChatInputSuggestion } from '@chenzy-design/core';

  interface Props {
    skills?: AIChatInputSkill[];
    suggestions?: AIChatInputSuggestion[];
    onSkillChange?: ((skill: AIChatInputSkill) => void) | undefined;
    onSuggestClick?: ((s: AIChatInputSuggestion) => void) | undefined;
  }

  let { skills = [], suggestions = [], onSkillChange, onSuggestClick }: Props = $props();
</script>

<AIChatInput {skills} {suggestions} {onSkillChange} {onSuggestClick}>
  {#snippet renderSkillItem({ skill, className, onClick, onMouseEnter })}
    <button
      type="button"
      class={className}
      data-testid="custom-skill"
      onmousedown={(e) => {
        e.preventDefault();
        onClick();
      }}
      onmouseenter={onMouseEnter}
    >
      自定义-{skill.label}
    </button>
  {/snippet}
  {#snippet renderSuggestionItem({ suggestion, className, onClick, onMouseEnter })}
    <button
      type="button"
      class={className}
      data-testid="custom-suggestion"
      onmousedown={(e) => {
        e.preventDefault();
        onClick();
      }}
      onmouseenter={onMouseEnter}
    >
      自定义-{typeof suggestion === 'string' ? suggestion : suggestion.content}
    </button>
  {/snippet}
</AIChatInput>
