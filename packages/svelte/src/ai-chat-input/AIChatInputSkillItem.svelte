<!--
  AIChatInputSkillItem — 技能面板单项（1:1 对齐 Semi skillItem.tsx）。

  与 Semi 一致：renderSkillItem 存在时**整项替换**（回传 { skill, className, onClick, onMouseEnter }
  让消费方自己渲染根节点），而非塞进默认外壳里——否则消费方拿不到激活态类名，也无法自定义
  根节点（见 render-prop-branch-must-keep-root-node）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { skillLabel, type AIChatInputSkill } from '@chenzy-design/core';

  interface Props {
    skill: AIChatInputSkill;
    isActive?: boolean;
    index: number;
    /** 整项替换渲染（对齐 Semi renderSkillItem，入参逐字段对齐 RenderSkillItemProps）。 */
    renderSkillItem?:
      | Snippet<
          [
            {
              skill: AIChatInputSkill;
              className: string;
              onClick: () => void;
              onMouseEnter: () => void;
            },
          ]
        >
      | undefined;
    onClick: (skill: AIChatInputSkill) => void;
    onMouseEnter: (index: number) => void;
  }

  let { skill, isActive = false, index, renderSkillItem, onClick, onMouseEnter }: Props = $props();

  // 对齐 Semi：className 由基类 + 激活类拼成，原样回传给自定义渲染。
  const className = $derived(
    `cd-ai-chat-input-skill-item${isActive ? ' cd-ai-chat-input-skill-item-active' : ''}`,
  );

  function handleClick(): void {
    onClick(skill);
  }

  function handleMouseEnter(): void {
    onMouseEnter(index);
  }
</script>

{#if renderSkillItem}
  {@render renderSkillItem({
    skill,
    className,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
  })}
{:else}
  <div
    class={className}
    role="option"
    aria-selected={isActive}
    tabindex="-1"
    onmousedown={(e) => {
      // mousedown 而非 click：避免编辑器先 blur 触发 useDismiss 关闭面板。
      e.preventDefault();
      handleClick();
    }}
    onmouseenter={handleMouseEnter}
  >
    <!-- 对齐 Semi skillItem.tsx：图标 + .-skill-item-content 两段 -->
    {#if typeof skill.icon === 'function'}
      {@const SkillIcon = skill.icon as Snippet}
      {@render SkillIcon()}
    {/if}
    <div class="cd-ai-chat-input-skill-item-content">{skillLabel(skill)}</div>
  </div>
{/if}

<style>
  /* Semi: &-skill &-item { flex + align-items:center + column-gap + padding + cursor:pointer } */
  .cd-ai-chat-input-skill-item {
    display: flex;
    align-items: center;
    column-gap: var(--cd-spacing-ai-chat-input-skill-item-columngap);
    padding: var(--cd-spacing-ai-chat-input-skill-item-paddingy)
      var(--cd-spacing-ai-chat-input-skill-item-paddingx);
    cursor: pointer;
  }

  /* Semi 只有 &-active 一条背景规则（无 :hover）——激活态由 onMouseEnter 写 index 驱动，
     所以鼠标悬浮的高亮走的也是 -active，不另加 :hover，否则键鼠两套高亮会同时亮。 */
  .cd-ai-chat-input-skill-item-active {
    background-color: var(--cd-color-ai-chat-input-skill-item-bg-active);
  }
</style>

