<script lang="ts">
  import { TagInput, Text } from '@chenzy-design/svelte';

  let reason = $state('');
  let rejected = $state('');
</script>

<div style="width: 360px">
  <TagInput
    defaultValue={['react', 'svelte']}
    separator={[',', 'Enter']}
    placeholder="仅允许字母，输入后回车添加"
    validateTag={(tag) => /^[a-z]+$/i.test(tag) || '仅允许字母'}
    onInvalid={({ tag, reason: r }) => {
      rejected = tag;
      reason = r;
    }}
  />
  <div style="margin-top: 8px">
    {#if reason}
      <Text type="danger">「{rejected}」被拒绝：{reason}</Text>
    {:else}
      <Text type="tertiary">试试输入包含数字或符号的标签</Text>
    {/if}
  </div>
</div>
