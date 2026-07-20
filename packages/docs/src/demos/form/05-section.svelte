<script lang="ts">
  // 表单分组：用 Form.Section 对字段按语义分区（仅影响布局，不影响数据结构）。对齐 Semi「表单分组」。
  import { Form, Button, Space, Radio } from '@chenzy-design/svelte';
</script>

<Form style="width: 560px">
  <Form.Section text="基本信息">
    <Form.Input field="name" label="考试名称" initValue="TCS 任务平台使用" />
  </Form.Section>
  <Form.Section text="合格标准">
    <div style="display: flex; gap: 16px;">
      <Form.InputNumber field="pass" initValue={60} style="width: 120px" label={{ text: '及格正确率', required: true }} />
      <Form.InputNumber field="count" initValue={10} style="width: 120px" label={{ text: '合格人数', required: true }} />
    </div>
  </Form.Section>
  <Form.Section text="考试时间">
    <Form.DatePicker field="date" label={{ text: '开始时间', required: true }} />
    <Form.RadioGroup field="type" label="有效时间" direction="vertical" initValue="always">
      <Radio value="always">永久有效</Radio>
      <Radio value="user">自定义有效期</Radio>
    </Form.RadioGroup>
  </Form.Section>
  <Form.Section text="考试人员">
    <Form.Switch field="open" label={{ text: '对外开放', required: true }} />
    <Form.Select
      field="users"
      label={{ text: '考生', required: true }}
      multiple
      initValue={['1', '2']}
      optionList={[
        { label: '曲晨一', value: '1' },
        { label: '夏可曼', value: '2' },
        { label: '曲晨三', value: '3' },
        { label: '蔡妍', value: '4' },
      ]}
    />
  </Form.Section>
  {#snippet footer()}
    <Space>
      <Button type="primary" htmlType="submit">创建考试</Button>
      <Button htmlType="reset">重置</Button>
    </Space>
  {/snippet}
</Form>
