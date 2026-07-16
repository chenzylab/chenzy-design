<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 400px">
  <!-- 各类 Form.* 控件：接管数据流，无须手动 value/onChange -->
  <Form
    initValues={{ agree: false, notify: true }}
    onSubmit={(r) => (result = r.valid ? JSON.stringify(r.values) : '校验未通过')}
  >
    <Form.Input field="name" label="姓名" required />
    <Form.Select
      field="city"
      label="城市"
      placeholder="请选择"
      optionList={[
        { label: '北京', value: 'bj' },
        { label: '上海', value: 'sh' },
        { label: '广州', value: 'gz' },
      ]}
    />
    <Form.DatePicker field="date" label="日期" />
    <Form.Switch field="notify" label="接收通知" />
    <Form.Checkbox field="agree" label="同意条款" required />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
