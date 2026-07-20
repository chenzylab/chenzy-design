<script lang="ts">
  // 使用 ArrayField（Form.List）：针对动态增删的数组类表单项，提供 add / remove /
  // addWithInitValue 简化操作。严格对齐 Semi「使用 ArrayField」demo
  //（Add new line / Add with init value + 每行 name Input + role Select + 删除 + 底部 formState）。
  import { Form, Button, TextArea } from '@chenzy-design/svelte';
  import { IconPlusCircle, IconMinusCircle } from '@chenzy-design/icons';

  const initValue = [
    { name: 'Semi D2C', role: 'Engineer' },
    { name: 'Semi C2D', role: 'Designer' },
  ];
  const roleOptions = [
    { label: 'Engineer', value: 'Engineer' },
    { label: 'Designer', value: 'Designer' },
  ];
</script>

<Form style="width: 800px" labelPosition="left" labelWidth="100px" allowEmpty>
  {#snippet children({ formState })}
    <Form.List name="rules" initialCount={initValue.length}>
      {#snippet children({ arrayFields, add, addWithInitValue })}
        <Button icon={plusIcon} theme="light" onclick={() => add()}>Add new line</Button>
        <Button
          icon={plusIcon}
          style="margin-left: 8px"
          onclick={() => addWithInitValue({ name: 'Semi DSM', role: 'Designer' })}
        >Add new line with init value</Button>
        {#each arrayFields as row (row.key)}
          <div style="display: flex; align-items: flex-start">
            <Form.Input
              field={row.name('name')}
              label={`rules[${row.index}].name`}
              initValue={initValue[row.index]?.name}
              style="width: 200px; margin-right: 16px"
            />
            <Form.Select
              field={row.name('role')}
              label={`rules[${row.index}].role`}
              initValue={initValue[row.index]?.role}
              optionList={roleOptions}
              style="width: 120px"
            />
            <Button
              type="danger"
              theme="borderless"
              icon={minusIcon}
              onclick={row.remove}
              style="margin: 12px"
            />
          </div>
        {/each}
      {/snippet}
    </Form.List>
    <TextArea value={JSON.stringify(formState)} style="margin-top: 10px" />
  {/snippet}
</Form>

{#snippet plusIcon()}<IconPlusCircle />{/snippet}
{#snippet minusIcon()}<IconMinusCircle />{/snippet}
