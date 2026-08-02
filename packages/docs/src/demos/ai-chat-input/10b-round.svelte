<script lang="ts">
  // 对齐 Semi「底部按钮形状」段：round 控制底部配置区/操作区按钮形状，
  // 默认 true（全圆角），设为 false 即方形按钮。
  import { AIChatInput, Button } from '@chenzy-design/svelte';

  let round = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Button size="small" onclick={() => (round = !round)}>
    round: {round ? 'true（圆角）' : 'false（方形）'}
  </Button>

  <AIChatInput {round} />
</div>
