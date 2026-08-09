<script lang="ts">
  // 表单分组：用 Form.Section 对字段按语义分区（仅影响布局，不影响数据结构）。
  // 严格对齐 Semi「表单分组」demo：字段、文案、初值、嵌套 DatePicker 逐条复刻。
  import { Form, Button, Space, Radio } from '@chenzy-design/svelte';
</script>

<Form style="width: 560px">
  <Form.Section text="基本信息">
    <Form.Input field="name" label="考试名称" initValue="TCS任务平台使用" style="width: 560px" />
  </Form.Section>
  <Form.Section text="合格标准">
    <div style="display: flex;">
      <Form.InputNumber field="pass" initValue={60} style="width: 80px" label={{ text: '及格正确率', required: true }} />
      <Form.InputNumber field="number" initValue={10} style="width: 80px" label={{ text: '合格人数', required: true }} />
    </div>
  </Form.Section>
  <Form.Section text="考试时间">
    <Form.DatePicker field="date" type="dateTime" initValue={new Date()} style="width: 272px" label={{ text: '开始时间', required: true }} />
    <div style="display: flex;">
      <Form.Input field="time" label="考试时长" style="width: 176px" initValue="60" addonAfter="分钟" />
      <Form.Checkbox initValue={true} noLabel field="auto" style="padding-top: 30px; margin-left: 12px">到时间自动交卷</Form.Checkbox>
    </div>
    <Form.RadioGroup field="type" label="有效时间" direction="vertical" initValue="always">
      <Radio value="always">永久有效</Radio>
      <Radio value="user">自定义有效期</Radio>
    </Form.RadioGroup>
    <Form.RadioGroup field="answerTime" label="答案放出时间" direction="vertical" initValue="always" rules={[{ required: true }]}>
      <Radio value="always">自动放出</Radio>
      <Radio value="user">
        <div style="display: inline-block">
          自定义放出时间
          <Form.DatePicker type="dateTimeRange" noLabel field="customTime" style="width: 464px; display: inline-block" />
        </div>
      </Radio>
    </Form.RadioGroup>
  </Form.Section>
  <Form.Section text="考试人员">
    <div style="display: flex;">
      <Form.Switch field="open" label={{ text: '对外开放', required: true }} checkedText="开" uncheckedText="关" />
    </div>
    <Form.Select
      field="users"
      label={{ text: '考生', required: true }}
      style="width: 560px"
      multiple
      initValue={['1', '2', '3', '4']}
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
      <Button type="primary" theme="solid" style="width: 120px; margin-top: 12px; margin-right: 4px">创建考试</Button>
      <Button style="margin-top: 12px">预览</Button>
    </Space>
  {/snippet}
</Form>
