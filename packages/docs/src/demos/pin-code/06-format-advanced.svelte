<script lang="ts">
  import { PinCode, Text, Space } from '@chenzy-design/svelte';
</script>

<Space vertical align="start">
  <!-- format 支持 'number' / 'mixed' / RegExp / 函数四种字符校验 -->
  <Space>
    <PinCode format="number" autoFocus={false} />
    <Text type="tertiary">number：纯数字</Text>
  </Space>
  <Space>
    <PinCode format="mixed" autoFocus={false} />
    <Text type="tertiary">mixed：数字 + 字母</Text>
  </Space>
  <Space>
    <PinCode format={/[A-Z]/} autoFocus={false} />
    <Text type="tertiary">RegExp /[A-Z]/：只大写字母</Text>
  </Space>
  <Space>
    <PinCode format={(char) => /[a-z]/.test(char)} autoFocus={false} />
    <Text type="tertiary">函数：只小写字母</Text>
  </Space>
</Space>
