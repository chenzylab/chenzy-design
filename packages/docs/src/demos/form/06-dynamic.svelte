<script lang="ts">
  import { Form, Button, Text } from '@chenzy-design/svelte';

  let result = $state('');
</script>

<div style="max-width: 440px">
  <!-- Form.List 动态字段：增删行，每行子字段名由 name(item, sub) 拼接 -->
  <Form onSubmit={(r) => (result = JSON.stringify(r.values))}>
    <Form.List name="users" initialCount={1}>
      {#snippet children({ items, name, add, remove })}
        {#each items as item, i (item.key)}
          <div style="display:flex;gap:8px;align-items:flex-start">
            <Form.Input field={name(item, 'name')} label={`成员 ${i + 1}`} required placeholder="姓名" />
            <Form.Input field={name(item, 'role')} label="角色" placeholder="角色" />
            <Button type="tertiary" size="small" onclick={() => remove(item)}>删除</Button>
          </div>
        {/each}
        <Button type="tertiary" size="small" onclick={() => add()}>+ 添加成员</Button>
      {/snippet}
    </Form.List>
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  {#if result}
    <div style="margin-top:8px"><Text type="tertiary">{result}</Text></div>
  {/if}
</div>
