<script lang="ts">
  // 自定义校验（Form 级别）：给 Form 整体设置 validator 函数，submit / formApi.validate()
  // 时调用，返回 { field: 错误信息 } 映射（空即通过）。支持同步与异步（返回 Promise）。
  // 严格对齐 Semi「自定义校验(Form 级别)」同步 demo（name + familyName 嵌套路径 + validator）。
  // 注：配置 Form 级校验器后，字段级 rules/validator 在 submit/validate 时不再触发。
  // 本库 validator 返回扁平 { fieldPath: message } 映射（fieldPath 支持 . / [] 嵌套路径）。
  import { Form, Button } from '@chenzy-design/svelte';

  function syncValidate(values: Record<string, unknown>) {
    const errors: Record<string, string> = {};
    if (values.name !== 'mike') errors.name = 'you must name mike';
    // 对齐 Semi：familyName 嵌套路径的错误示例
    errors['familyName[0].before'] = 'before error balabala';
    errors['familyName[0].after'] = 'after error balabala';
    errors['familyName[1]'] = 'familyName[1] error balabala';
    return errors;
  }
</script>

<Form validator={syncValidate} layout="horizontal">
  <Form.Input field="name" trigger="blur" />
  <Form.Input field="familyName[0].before" trigger="blur" />
  <Form.Input field="familyName[0].after" trigger="blur" />
  <Form.Input field="familyName[1]" trigger="blur" />
  <div style="display: flex; align-items: flex-end; gap: 8px">
    <Button type="primary" htmlType="submit">Submit</Button>
    <Button htmlType="reset">reset</Button>
  </div>
</Form>
