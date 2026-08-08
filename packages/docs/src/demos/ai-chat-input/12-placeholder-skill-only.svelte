<script lang="ts">
  // 对齐 Semi showPlaceholderWhenSkillOnly：
  // 默认（false）选中技能后 placeholder 立即消失；
  // 开启后「只选了技能、还没输入正文」时 placeholder 仍显示，且排在 skill 后方。
  // 两个实例并列对照：按 / 唤起技能面板 → 选一个技能 → 观察占位符差异。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputSkill } from '@chenzy-design/svelte';

  const skills: AIChatInputSkill[] = [
    { label: '总结', value: 'summarize' },
    { label: '翻译', value: 'translate' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <div>
    <p style="margin: 0 0 8px; color: var(--cd-color-text-2); font-size: 12px;">
      showPlaceholderWhenSkillOnly（选中技能后占位符仍在，显示在技能后方）
    </p>
    <AIChatInput placeholder="输入消息" {skills} showPlaceholderWhenSkillOnly />
  </div>

  <div>
    <p style="margin: 0 0 8px; color: var(--cd-color-text-2); font-size: 12px;">
      默认行为（选中技能后占位符消失）
    </p>
    <AIChatInput placeholder="输入消息" {skills} />
  </div>
</div>
