<script lang="ts">
  // 自定义校验（Field 级别）：通过 rules[].validator 给单个控件设置自定义校验，支持同步、
  // 异步（返回 Promise）。严格对齐 Semi「自定义校验(Field 级别)」demo（name 异步 2s + familyName 同步）。
  // 注：本库 Field 级自定义校验经 rules[].validator 表达（Semi 的 Field validator 直接 prop
  // 与 rules[].validator 本是两个 API，本库统一走 rules）。validator 返回错误信息字符串或 undefined。
  import { Form, Button } from '@chenzy-design/svelte';

  function validateName(val: unknown): string | undefined {
    if (!val) return '【sync】can\'t be empty';
    if (typeof val === 'string' && val.length <= 5) return '【sync】must more than 5';
    return undefined;
  }

  function asyncValidate(val: unknown): Promise<string | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!val) resolve('【async】can\'t be empty');
        else if (typeof val === 'string' && val.length <= 5) resolve('【async】must more than 5');
        else resolve(undefined);
      }, 2000);
    });
  }
</script>

<Form>
  <Form.Input
    field="name"
    label="【name】asyncValidate after 2s"
    trigger="blur"
    rules={[{ validator: asyncValidate }]}
  />
  <Form.Input
    field="familyName"
    label="【familyName】syncValidate"
    trigger="blur"
    rules={[{ validator: validateName }]}
  />
  <Button htmlType="reset">reset</Button>
</Form>
