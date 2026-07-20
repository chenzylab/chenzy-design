<script lang="ts">
  // helpText 与校验信息共用同一区块（两者均有值时优先展示校验信息）；
  // extraText 常显额外提示，位于 helpText / error 之后；
  // extraTextPosition 控制其显示位置（bottom / middle）。对齐 Semi「helpText、extraText」。
  import { Form } from '@chenzy-design/svelte';
</script>

<Form style="width: 400px">
  <Form.Input
    field="Password"
    label="密码"
    helpText="6-16 位，区分大小写"
    extraText="忘记密码？点击找回"
  />
  <Form.InputNumber
    field="force"
    label="强制读取(可选)"
    placeholder="秒"
    extraText="对于对话框通知，可指定该消息必须在指定时长后才可置为已读。"
    extraTextPosition="middle"
  />
</Form>
