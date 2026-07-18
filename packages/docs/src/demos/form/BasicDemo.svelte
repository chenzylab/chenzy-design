<script lang="ts">
  import { Form, Button, Text, Space, Checkbox } from '@chenzy-design/svelte';

  let submitted = $state('');
  let warnSubmitted = $state('');
  let valuePropSubmitted = $state('');
  let specPropsSubmitted = $state('');
  let nativeSubmitCount = $state(0);
  let fieldPropsSubmitted = $state('');
  let extStatus = $state<'default' | 'warning' | 'error'>('error');
</script>

<!-- 基础校验 + 提交 -->
<div style="max-width: 360px">
  <Text type="tertiary">基础校验（email + required）：</Text>
  <Form
    onSubmit={(r) =>
      (submitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
  >
    <Form.Input field="email" label="邮箱" required rules={[{ type: 'email' }]} />
    <Form.Input field="name" label="昵称" required />
    {#snippet footer({ submitting })}
      <Button type="primary" htmlType="submit" loading={submitting}>提交</Button>
    {/snippet}
  </Form>
  <Text type="tertiary">{submitted}</Text>
</div>

<!-- inset label -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-inset">
  <Text type="tertiary">inset label（聚焦/有值时上浮）：</Text>
  <Form labelPosition="inset">
    <Form.Input field="city" label="城市" />
    <Form.Input field="company" label="公司" />
  </Form>
</div>

<!-- Form.List 动态字段数组 -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-list">
  <Text type="tertiary">Form.List 动态字段数组（增/删联系人）：</Text>
  <Form>
    <Form.List name="contacts" initialCount={1}>
      {#snippet children({ items, name, add, remove })}
        {#each items as item, i (item.key)}
          <div style="display:flex; gap:8px; align-items:flex-start">
            <div style="flex:1">
              <Form.Input field={name(item, 'name')} label={`联系人 ${i + 1}`} required />
            </div>
            <button
              type="button"
              style="margin-top:28px"
              onclick={() => remove(item)}
            >删除</button>
          </div>
        {/each}
        <Button onclick={() => add()}>+ 添加联系人</Button>
      {/snippet}
    </Form.List>
  </Form>
</div>

<!-- 字段联动 dependencies -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-dependencies">
  <Text type="tertiary">字段联动 dependencies（确认密码依赖密码）：</Text>
  <Form>
    <Form.Input field="password" label="密码" type="password" required />
    <Form.Input
      field="confirm"
      label="确认密码"
      type="password"
      required
      dependencies={['password']}
      rules={[
        {
          validator: (v, values) =>
            v === values.password ? undefined : '两次输入的密码不一致',
        },
      ]}
    />
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
</div>

<!-- scrollToError -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-scroll-to-error">
  <Text type="tertiary">scrollToError（提交滚动到首个错误字段）：</Text>
  <Form scrollToError>
    <Form.Input field="s_a" label="字段 A" required />
    <Form.Input field="s_b" label="字段 B" required />
    <Form.Input field="s_c" label="字段 C" required />
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
</div>

<!-- validating 异步校验 -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-validating">
  <Text type="tertiary">validating（异步校验中显示加载指示）：</Text>
  <Form>
    <Form.Input
      field="username"
      label="用户名"
      rules={[
        {
          validator: (v) =>
            new Promise((resolve) =>
              setTimeout(() => resolve(v === 'taken' ? '该用户名已被占用' : undefined), 800),
            ),
        },
      ]}
    />
  </Form>
</div>

<!-- warningOnly 非阻塞警告 -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-warning">
  <Text type="tertiary">warningOnly（非阻塞警告，不影响提交）：</Text>
  <Form
    onSubmit={(r) => (warnSubmitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
  >
    <Form.Input
      field="nickname"
      label="昵称"
      rules={[{ minLength: 6, warningOnly: true, message: '建议昵称不少于 6 个字符' }]}
    />
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
  <Text type="tertiary">{warnSubmitted}</Text>
</div>

<!-- valuePropName="checked" -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-valueprop">
  <Text type="tertiary">valuePropName="checked"（Checkbox 接入表单字段）：</Text>
  <Form
    onSubmit={(r) =>
      (valuePropSubmitted = r.valid ? `提交成功：${JSON.stringify(r.values)}` : '校验未通过')}
  >
    <Form.Field
      field="agree"
      valuePropName="checked"
      required
      rules={[{ validator: (v) => (v === true ? undefined : '请勾选同意协议') }]}
    >
      {#snippet children({ checked, onChange })}
        <Checkbox checked={checked === true} onChange={(c) => onChange(c)}>
          我已阅读并同意用户协议
        </Checkbox>
      {/snippet}
    </Form.Field>
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
  <Text type="tertiary">{valuePropSubmitted}</Text>
</div>

<!-- spec §4 props -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-spec-props">
  <Text type="tertiary">spec §4 props（labelAlign=right / validateTrigger=blur / showValidateIcon / stopValidateWithError / allowEmpty）：</Text>
  <Form
    labelPosition="left"
    labelWidth={88}
    labelAlign="right"
    validateTrigger="blur"
    showValidateIcon
    stopValidateWithError
    allowEmpty
    onSubmit={(r) =>
      (specPropsSubmitted = `valid=${r.valid} values=${JSON.stringify(r.values)}`)}
  >
    <Form.Input
      field="sp_email"
      label="邮箱"
      required
      rules={[{ type: 'email' }, { minLength: 20 }]}
    />
    <Form.Input field="sp_note" label="备注" trigger="change" />
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
  <Text type="tertiary">{specPropsSubmitted}</Text>
</div>

<!-- stopPropagation：对象形态分别控制 submit/reset 冒泡 -->
<div style="max-width: 360px; margin-top: 16px" data-testid="form-stop-propagation">
  <Text type="tertiary">stopPropagation={'{ submit: true }'}（阻止 submit 冒泡）：</Text>
  <Form
    stopPropagation={{ submit: true }}
    onSubmit={() => {
      nativeSubmitCount += 1;
    }}
  >
    <Form.Input field="sp_name" label="名称" />
    {#snippet footer()}
      <Button type="primary" htmlType="submit">提交</Button>
    {/snippet}
  </Form>
  <Text type="tertiary">onSubmit 次数：{nativeSubmitCount}</Text>
</div>

<!-- Form.Field spec §4.2 -->
<div style="max-width: 520px; margin-top: 16px" data-testid="form-field-props">
  <Text type="tertiary">Form.Field spec §4.2（initValue / validateStatus / noStyle / span / transform）：</Text>
  <Form
    onSubmit={(r) =>
      (fieldPropsSubmitted = r.valid
        ? `提交值：${JSON.stringify(r.values)}`
        : '校验未通过')}
  >
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-items:start">
      <Form.Input field="fp_first" label="名" initValue="三" span={1} />
      <Form.Input field="fp_last" label="姓" initValue="张" span={1} />
      <Form.Input
        field="fp_code"
        label="编码（提交时大写）"
        span={2}
        transform={(v) => String(v ?? '').trim().toUpperCase()}
      />
      <Form.Input
        field="fp_ext"
        label="外部受控态"
        validateStatus={extStatus}
        span={2}
      />
      <div style="grid-column:span 2">
        <Form.Field field="fp_hidden" initValue="hidden-collected" noStyle>
          {#snippet children({ value })}
            <Text type="tertiary">noStyle 字段值（无布局，仍参与收集）：{String(value)}</Text>
          {/snippet}
        </Form.Field>
      </div>
    </div>
    {#snippet footer()}
      <Space>
        <Button type="primary" htmlType="submit">提交</Button>
        <Button
          onclick={() =>
            (extStatus =
              extStatus === 'error'
                ? 'warning'
                : extStatus === 'warning'
                  ? 'default'
                  : 'error')}>切换受控态（{extStatus}）</Button
        >
      </Space>
    {/snippet}
  </Form>
  <Text type="tertiary">{fieldPropsSubmitted}</Text>
</div>
