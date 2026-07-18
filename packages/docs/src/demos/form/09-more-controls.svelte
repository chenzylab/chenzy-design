<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 400px">
  <!-- 批C-B 新增薄封装：TextArea / InputNumber / CheckboxGroup / RadioGroup / TimePicker / AutoComplete / PinCode -->
  <Form
    initValues={{ hobbies: ['read'], gender: 'f', notify: true }}
    onSubmit={(r) => (result = r.valid ? JSON.stringify(r.values) : '校验未通过')}
  >
    <Form.TextArea field="bio" label="简介" placeholder="介绍一下自己" rows={2} />
    <Form.InputNumber field="age" label="年龄" min={0} max={120} />
    <Form.CheckboxGroup
      field="hobbies"
      label="爱好"
      options={[
        { label: '阅读', value: 'read' },
        { label: '运动', value: 'sport' },
        { label: '音乐', value: 'music' },
      ]}
    />
    <Form.RadioGroup
      field="gender"
      label="性别"
      options={[
        { label: '男', value: 'm' },
        { label: '女', value: 'f' },
      ]}
    />
    <Form.TimePicker field="time" label="时间" />
    <Form.AutoComplete
      field="site"
      label="站点"
      placeholder="输入以补全"
      data={['github.com', 'gitlab.com', 'bitbucket.org']}
    />
    <Form.PinCode field="code" label="验证码" count={4} autoFocus={false} />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
