<script lang="ts">
  // 交互式密码强度校验：validator 返回错误信息驱动 validateStatus/helpText，
  // showValidateIcon 展示状态图标；点击「随机生成」通过 formApi.setValue + setError 写回。
  // 对齐 Semi「helpText、extraText」第①个 demo。
  import { Form, Button } from '@chenzy-design/svelte';
  import type { FormApi } from '@chenzy-design/svelte';

  let helpText = $state('');
  let validateStatus = $state<'default' | 'warning' | 'error'>('default');
  let formApi = $state<FormApi | undefined>(undefined);

  function validator(value: unknown): string | undefined {
    const val = value as string | undefined;
    if (!val) {
      validateStatus = 'error';
      return '密码不能为空';
    } else if (val.length <= 3) {
      validateStatus = 'warning';
      helpText = '密码强度：弱';
      return undefined; // validate pass
    } else {
      // Semi 此分支用 validateStatus='success' 展示绿色态；本库 validateStatus 只有
      // default/warning/error（无 success），故退化为 default（无错误态展示）。
      helpText = '';
      validateStatus = 'default';
      return undefined;
    }
  }

  function random() {
    const pw = Math.floor(Math.random() * 100000).toString().slice(0, 5);
    formApi?.setValue('Password', pw);
    formApi?.setError('Password', undefined);
    helpText = '';
    validateStatus = 'default';
  }
</script>

<Form
  showValidateIcon={true}
  getFormApi={(api) => (formApi = api)}
  onSubmit={(r) => console.log('submit success', r.values)}
  onSubmitFail={(errors) => console.log(errors)}
>
  <Form.Input
    field="Password"
    label="密码"
    rules={[{ validator }]}
    validateStatus={validateStatus}
    helpText={helpText}
  />
  <Button theme="borderless" onclick={random} style="margin-top: 4px; padding: 0;">
    没有想到合适的密码？点击随机生成一个
  </Button>
</Form>
