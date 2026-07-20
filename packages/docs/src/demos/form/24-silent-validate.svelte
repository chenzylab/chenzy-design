<script lang="ts">
  // 静默校验：formApi.validate({ silent: true }) 获取校验结果但不触发 UI 更新
  //（不显示错误提示、不设置 touched）。用于「根据校验结果决定是否发起后端请求」等场景。
  // 严格对齐 Semi「静默校验」demo（用户名 + 邮箱 + 静默/普通两按钮 + Toast 反馈）。
  // 注：本库 validate 返回 Promise<boolean>（Semi 为 resolve values / reject errors），
  // 故以 boolean 分支 Toast，语义与 Semi 一致。
  import { Form, Button, Toast } from '@chenzy-design/svelte';
  import type { FormApi } from '@chenzy-design/svelte';

  let formApi = $state<FormApi | undefined>(undefined);

  async function handleSilentValidate() {
    if (!formApi) return;
    const valid = await formApi.validate({ silent: true });
    if (valid) Toast.success('表单校验通过，准备发起请求');
    else Toast.error('表单校验未通过，但不显示错误提示');
  }

  async function handleNormalValidate() {
    if (!formApi) return;
    const valid = await formApi.validate();
    if (valid) Toast.success('表单校验通过');
    else Toast.error('表单校验未通过，显示错误提示');
  }
</script>

<Form getFormApi={(api) => (formApi = api)} layout="horizontal">
  <Form.Input
    field="username"
    label="用户名"
    rules={[
      { required: true, message: '用户名不能为空' },
      { minLength: 3, message: '用户名至少 3 个字符' },
    ]}
  />
  <Form.Input
    field="email"
    label="邮箱"
    rules={[
      { required: true, message: '邮箱不能为空' },
      { type: 'email', message: '邮箱格式不正确' },
    ]}
  />
  <div style="display: flex; gap: 12px; margin-top: 12px">
    <Button onclick={handleSilentValidate} type="primary">静默校验（不显示错误）</Button>
    <Button onclick={handleNormalValidate}>普通校验（显示错误）</Button>
  </div>
</Form>
