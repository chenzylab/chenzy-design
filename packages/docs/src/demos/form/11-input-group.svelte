<script lang="ts">
  // Form.InputGroup：把多字段的 Label / ErrorMessage 上提到 group 级统一渲染，
  // 控件无缝拼接，GroupError 聚合组内所有字段错误（对齐 Semi Form.InputGroup）。
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let submitted = $state('');
</script>

<div style="max-width: 420px">
  <Form
    labelPosition="top"
    onSubmit={(r) => (submitted = r.valid ? `提交：${JSON.stringify(r.values)}` : '校验未通过')}
  >
    <!-- 组级 label + 组内两个字段拼接；错误统一在组下方聚合 -->
    <Form.InputGroup label={{ text: '联系方式', required: true }} extraText="国家区号 + 手机号">
      <Form.Input field="areaCode" initValue="+86" required rules={[{ pattern: /^\+\d+$/, message: '区号格式错误' }]} />
      <Form.Input field="phone" required rules={[{ pattern: /^\d{6,}$/, message: '手机号至少 6 位' }]} />
    </Form.InputGroup>

    <Button htmlType="submit" size="small" style="margin-top:12px">提交</Button>
  </Form>
  {#if submitted}
    <div style="margin-top:8px"><Text type="tertiary">{submitted}</Text></div>
  {/if}
</div>
