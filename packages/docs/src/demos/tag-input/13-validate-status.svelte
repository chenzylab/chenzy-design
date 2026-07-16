<script lang="ts">
  import { TagInput, Space, Text } from '@chenzy-design/svelte';
</script>

<Space vertical align="start" style="width: 320px">
  <div>
    <Text type="secondary">default</Text>
    <TagInput defaultValue={['svelte', 'vite']} placeholder="默认状态" />
  </div>
  <div>
    <Text type="warning">warning</Text>
    <TagInput
      validateStatus="warning"
      defaultValue={['需复核']}
      placeholder="警告状态"
    />
  </div>
  <div>
    <Text type="danger">error</Text>
    <TagInput
      validateStatus="error"
      defaultValue={['非法标签']}
      placeholder="错误状态"
    />
  </div>
</Space>
