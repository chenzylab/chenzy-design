<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let tags = $state<string[]>(['urgent', 'design']);
</script>

<div style="width: 360px">
  <TagInput
    value={tags}
    placeholder="自定义标签渲染"
    onChange={(t) => (tags = t)}
  >
    {#snippet renderTagItem({ value, index, onClose })}
      <span
        style="display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:999px;background:var(--cd-color-primary-light-default);color:var(--cd-color-primary);font-size:12px"
      >
        #{index + 1} {value}
        <button
          type="button"
          aria-label="移除"
          style="border:none;background:transparent;color:inherit;cursor:pointer;padding:0;line-height:1"
          onclick={onClose}>×</button
        >
      </span>
    {/snippet}
  </TagInput>
  <Text type="tertiary">标签：{tags.join(' / ') || '（无）'}</Text>
</div>
