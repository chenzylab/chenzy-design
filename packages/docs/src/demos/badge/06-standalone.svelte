<script lang="ts">
  import { Badge, Space } from '@chenzy-design/svelte';
</script>

<Space vertical align="start" spacing={20}>
  <Badge count={5} />
  <Badge count="NEW" theme="light" />
  <Badge count={99} overflowCount={10} type="danger" />
  <Space vertical align="start" spacing={4}>
    <span><Badge dot type="primary" /> 进行中 processing</span>
    <span><Badge dot type="tertiary" /> 信息 info</span>
    <span><Badge dot type="success" /> 成功 success</span>
    <span><Badge dot type="warning" /> 提醒 warning</span>
    <span><Badge dot type="danger" /> 错误 error</span>
  </Space>
</Space>
