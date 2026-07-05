<script lang="ts">
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputSkill } from '@chenzy-design/svelte';

  // 空编辑区按 skillHotKey（默认 '/'）弹出技能面板：↑↓ 导航 / Enter 选中 / Esc 关闭。
  // 选中后技能作为 skill-slot 节点插入编辑器（inline chip，可删除）。
  // hasTemplate 的技能选中后展示「模版」按钮，点击弹出 renderTemplate 面板。
  const skills: AIChatInputSkill[] = [
    { label: '总结', value: 'summarize' },
    { label: '翻译', value: 'translate', hasTemplate: true },
    { label: '润色', value: 'polish' },
  ];
  let picked = $state('（按 / 唤起技能）');

  const templates: Record<string, string[]> = {
    translate: ['把以下内容翻译成英文：', '把以下内容翻译成日文：'],
  };
</script>

<div style="max-width: 560px;">
  <AIChatInput
    {skills}
    skillHotKey="/"
    placeholder="按 / 唤起技能…"
    onSkillChange={(s) => (picked = s.label ?? s.value ?? '')}
  >
    {#snippet renderTemplate({ skill, setContent })}
      <div style="display: flex; flex-direction: column; gap: 8px;">
        {#each templates[skill.value ?? ''] ?? [] as tpl}
          <button
            type="button"
            style="text-align: left; padding: 8px; border: none; background: var(--cd-color-fill-0); border-radius: 6px; cursor: pointer;"
            onclick={() => setContent(`<p>${tpl}</p>`)}
          >
            {tpl}
          </button>
        {/each}
      </div>
    {/snippet}
  </AIChatInput>
  <p style="margin-top: 12px; color: var(--cd-color-text-2);">已选技能：{picked}</p>
</div>
