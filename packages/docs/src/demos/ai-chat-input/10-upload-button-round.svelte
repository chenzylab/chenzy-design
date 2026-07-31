<script lang="ts">
  // 对齐 Semi「自定义上传按钮」+「底部按钮形状」两段：
  //   renderUploadButton 仅自定义按钮 UI（内置上传/粘贴逻辑保留）；
  //   round 控制底部按钮形状，默认 true（圆角），false 为方形。
  import { AIChatInput, Button } from '@chenzy-design/svelte';
  import { IconPlus } from '@chenzy-design/icons';

  let round = $state(true);
</script>

<div style="display: flex; flex-direction: column; gap: 12px;">
  <Button size="small" onclick={() => (round = !round)}>
    round: {round ? 'true（圆角）' : 'false（方形）'}
  </Button>

  <AIChatInput {round} renderUploadButton={uploadButton} />
</div>

{#snippet uploadButton({ openFileDialog, disabled }: { openFileDialog: () => void; disabled: boolean })}
  <Button size="small" type="tertiary" theme="borderless" {disabled} onclick={openFileDialog}>
    <IconPlus />
    <span style="margin-left: 4px;">添加附件</span>
  </Button>
{/snippet}
