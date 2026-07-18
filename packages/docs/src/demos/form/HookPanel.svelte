<script lang="ts">
  // 后代组件：用 useFormApi / useFormState / getFieldApi 拿表单与字段句柄（对齐 Semi hooks）。
  import { useFormApi, useFormState, getFieldApi, Button, Space, Text } from '@chenzy-design/svelte';

  const api = useFormApi();
  const nameApi = getFieldApi('name');
</script>

<Space vertical align="start" style="margin-top:12px">
  <Text type="tertiary">
    useFormState().values.name = {String(useFormState()?.values.name ?? '（空）')}
  </Text>
  <Space>
    <Button size="small" onclick={() => nameApi.setValue('由 getFieldApi 写入')}>
      getFieldApi 写 name
    </Button>
    <Button size="small" type="tertiary" onclick={() => nameApi.setError('由 getFieldApi 塞入的错误')}>
      塞字段错误
    </Button>
    <Button size="small" type="tertiary" onclick={() => api?.reset()}>useFormApi 重置</Button>
  </Space>
</Space>
