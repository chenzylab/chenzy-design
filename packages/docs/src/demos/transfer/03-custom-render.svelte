<script lang="ts">
  import { Transfer, Text } from '@chenzy-design/svelte';

  // 自定义渲染 + 禁用项：renderSourceItem / renderSelectedItem 自定义两侧行内容，
  // disabled 标记不可迁移的项。onSelect / onDeselect 跟踪单项勾选。
  type Member = { key: string; label: string; role: string; disabled?: boolean };

  const data: Member[] = [
    { key: 'u1', label: '艾伦', role: '设计' },
    { key: 'u2', label: '贝拉', role: '前端' },
    { key: 'u3', label: '陈默', role: '后端', disabled: true },
    { key: 'u4', label: '丁宁', role: '产品' },
    { key: 'u5', label: '方圆', role: '测试' },
  ];

  const roleOf = (key: string | number) =>
    data.find((d) => d.key === key)?.role ?? '';

  let value = $state<(string | number)[]>(['u2']);
  let lastAction = $state('（无）');
</script>

<Transfer
  dataSource={data}
  {value}
  titles={['可选成员', '已选成员']}
  onChange={(keys) => (value = keys)}
  onSelect={(item) => (lastAction = `勾选 ${item.label}`)}
  onDeselect={(item) => (lastAction = `取消 ${item.label}`)}
>
  {#snippet renderSourceItem({ item, onChange, checked })}
    <button
      type="button"
      onclick={onChange}
      disabled={item.disabled}
      style="display:flex;align-items:center;gap:8px;width:100%;background:none;border:none;padding:4px 0;cursor:pointer;text-align:left;font:inherit;color:inherit;"
    >
      <span
        style="width:14px;height:14px;border-radius:3px;flex:none;border:1px solid var(--cd-color-border);background:{checked
          ? 'var(--cd-color-primary)'
          : 'transparent'};"
      ></span>
      <strong>{item.label}</strong>
      <span style="margin-left:auto;color:var(--cd-color-text-2);font-size:12px;"
        >{roleOf(item.key)}</span
      >
    </button>
  {/snippet}
  {#snippet renderSelectedItem({ item, onRemove })}
    <span>{item.label} · {roleOf(item.key)}</span>
    <button
      type="button"
      onclick={onRemove}
      style="margin-left:auto;background:none;border:none;color:var(--cd-color-text-2);cursor:pointer;"
      aria-label="移除">×</button
    >
  {/snippet}
</Transfer>
<Text type="tertiary">最近操作：{lastAction}（陈默已禁用，不可迁移）</Text>
