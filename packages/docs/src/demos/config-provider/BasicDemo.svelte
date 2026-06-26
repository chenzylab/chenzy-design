<script lang="ts">
  import {
    ConfigProvider,
    Button,
    Tag,
    Switch,
    Dropdown,
    Form,
    Text,
  } from '@chenzy-design/svelte';

  let cpAppliedTheme = $state<'light' | 'dark'>('light');
  let cpReduced = $state(false);
  let cpReducedApplied = $state(false);
  let cpValidateMsg = $state('');
  let cpPopupHost = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary">用 ConfigProvider wrap + theme=dark 在子树内建立独立暗色作用域</Text>
<ConfigProvider wrap theme="dark">
  <div style="margin-top:8px; padding:24px; border-radius:8px; background:var(--cd-color-bg-0); color:var(--cd-color-text-0)">
    <p style="margin:0 0 12px; line-height:1.8">
      这个区块被 ConfigProvider theme="dark" 包裹，内部所有 <code>var(--cd-color-*)</code> 自动切换为暗色调色板。
    </p>
    <div style="display:flex; gap:12px">
      <Button type="primary">主要按钮</Button>
      <Button>次要按钮</Button>
      <Tag color="success">标签</Tag>
    </div>
  </div>
</ConfigProvider>

<div style="margin-top:16px">
  <Text type="tertiary">theme="auto" 跟随系统 prefers-color-scheme 实时切 light/dark，切换系统外观会即时响应</Text>
  <ConfigProvider
    wrap
    theme="auto"
    onThemeChange={(info) => (cpAppliedTheme = info.applied)}
  >
    <div style="margin-top:8px; padding:24px; border-radius:8px; background:var(--cd-color-bg-0); color:var(--cd-color-text-0)">
      <p style="margin:0 0 12px; line-height:1.8">
        当前系统解析主题：<strong>{cpAppliedTheme}</strong>
      </p>
      <div style="display:flex; gap:12px">
        <Button type="primary">主要按钮</Button>
        <Tag color="success">标签</Tag>
      </div>
    </div>
  </ConfigProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">reducedMotion 显式开启时写全局 data-reduced-motion 标记，令依赖 motion-duration token 的动画退化为 0ms</Text>
  <ConfigProvider
    reducedMotion={cpReduced}
    onReducedMotionChange={(info) => (cpReducedApplied = info.reduced)}
  >
    <div style="margin-top:8px; display:flex; align-items:center; gap:8px">
      <Switch value={cpReduced} onChange={(v) => (cpReduced = v)} />
      <Text type="tertiary">
        reducedMotion={String(cpReduced)} · reduced={String(cpReducedApplied)}
      </Text>
    </div>
  </ConfigProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">wrap=true 时 as 可把包裹元素改为 section/article/main 等语义标签（display:contents 不打断 a11y 树）</Text>
  <ConfigProvider wrap as="section">
    <div style="margin-top:8px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px">
      <Text type="tertiary">外层包裹元素标签为 <code>&lt;section&gt;</code>（见 DOM）</Text>
    </div>
  </ConfigProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">getValidateMessages 在 locale 内置文案之上按 Form.* 键覆盖校验提示（支持{' {label} '}插值），不传字段回退默认</Text>
  <ConfigProvider
    getValidateMessages={() => ({
      'Form.required': '【{label}】这一项必须填写哦',
    })}
  >
    <div style="max-width:360px; margin-top:8px">
      <Form onSubmit={(r) => (cpValidateMsg = r.valid ? '校验通过' : '校验未通过（看上方提示）')}>
        <Form.Input field="nickname" label="昵称" required />
        {#snippet footer({ submitting })}
          <Button type="primary" htmlType="submit" loading={submitting}>提交（不填触发）</Button>
        {/snippet}
      </Form>
      <Text type="tertiary">{cpValidateMsg}</Text>
    </div>
  </ConfigProvider>
</div>

<div style="margin-top:16px">
  <Text type="tertiary">getPopupContainer 经 context 提供全局默认容器；Dropdown 未传自身 prop 时浮层 portal 到此容器（而非 body）</Text>
  <div
    bind:this={cpPopupHost}
    style="position:relative; margin-top:8px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px"
  >
    <Text type="tertiary">浮层挂载宿主（下方菜单将 portal 进这里）：</Text>
    <div style="margin-top:8px">
      <ConfigProvider getPopupContainer={() => cpPopupHost ?? document.body}>
        <Dropdown
          items={[
            { key: 'a', label: '选项 A' },
            { key: 'b', label: '选项 B' },
          ]}
          trigger="click"
        >
          {#snippet triggerContent()}
            <Button>打开菜单</Button>
          {/snippet}
        </Dropdown>
      </ConfigProvider>
    </div>
  </div>
</div>
