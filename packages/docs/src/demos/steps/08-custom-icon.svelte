<script lang="ts">
  import { Steps } from '@chenzy-design/svelte';
  import { IconHome, IconLock } from '@chenzy-design/icons';
</script>

<!-- 通过 Steps.Step 的 icon 启用自定义图标、status 自定义每步状态（对齐 Semi 具名图标）。 -->
{#snippet homeIcon()}<IconHome size="extra-large" />{/snippet}
{#snippet lockIcon()}<IconLock size="extra-large" />{/snippet}

<Steps type="basic" onChange={(i) => console.log(i)}>
  <Steps.Step status="finish" title="已完成" />
  <Steps.Step status="error" title="错误" />
  <Steps.Step status="warning" title="警告" />
  <Steps.Step status="process" title="正在进行" icon={homeIcon} />
  <Steps.Step status="wait" title="等待" icon={lockIcon} />
</Steps>
