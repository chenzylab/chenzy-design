<script lang="ts">
  import { Popover, Tag } from '@chenzy-design/svelte';
</script>

<Popover>
  {#snippet content()}
    <div style="padding: 12px; max-width: 260px;">
      <div style="font-weight: 600; margin-bottom: 8px;">先进的设计 / 研发协作方式</div>
      <div style="color: var(--cd-color-text-2); line-height: 1.6;">
        使用 chenzy-design 快速还原设计稿，一键转代码。气泡卡片可以承载比 Tooltip 更复杂的内容。
      </div>
    </div>
  {/snippet}
  <Tag>悬停此处</Tag>
</Popover>
