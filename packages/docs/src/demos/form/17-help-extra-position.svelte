<script lang="ts">
  // extraTextPosition 控制 extraText 显示位置（bottom 默认 / middle）。
  // 可在 Form 上统一配置，也可在每个 Field 上单独配置，同时传入时以 Field 配置为准。
  // 对齐 Semi「helpText、extraText」第②个 demo。
  import { Form } from '@chenzy-design/svelte';

  const notifyText = '未勾选时，默认为红点提醒，消息默认进入收件人消息列表。对于重要通知，可同时勾选相应的通知方式。';
  const forceText = '对于对话框通知，可指定该消息必须在指定时长后才可置为已读。';
</script>

<Form extraTextPosition="middle">
  <Form.CheckboxGroup
    direction="horizontal"
    field="notify"
    label="通知方式"
    extraText={notifyText}
    options={[
      { label: '飞书通知', value: 'lark' },
      { label: '邮件通知', value: 'email' },
      { label: '顶部横幅通知', value: 'notification' },
    ]}
  />
  <Form.InputNumber field="force" label="强制读取(可选)" placeholder="秒" extraText={forceText} extraTextPosition="bottom" />
</Form>
