<script lang="ts">
  import { Popconfirm, Button, RadioGroup, Radio } from '@chenzy-design/svelte';
  import { IconAlertTriangle } from '@chenzy-design/icons';

  // Popconfirm 无 type 分级 prop（对齐 Semi）：不同风格由 icon 颜色 + okType 搭配得到。
  type Kind = 'default' | 'warning' | 'danger' | 'tertiary';
  let kind = $state<Kind>('default');
  let visible = $state(true);

  const iconColor: Record<Kind, string> = {
    default: 'var(--cd-color-warning)',
    warning: 'var(--cd-color-warning)',
    danger: 'var(--cd-color-danger)',
    tertiary: 'var(--cd-color-tertiary)',
  };
  const okType: Record<Kind, 'primary' | 'danger'> = {
    default: 'primary',
    warning: 'primary',
    danger: 'danger',
    tertiary: 'primary',
  };
  const labelColor: Record<Kind, string> = {
    default: 'var(--cd-color-primary)',
    warning: 'var(--cd-color-warning)',
    danger: 'var(--cd-color-danger)',
    tertiary: 'var(--cd-color-tertiary)',
  };
</script>

<div style="display: flex; flex-direction: column; gap: 14px; align-items: flex-start;">
  <RadioGroup type="button" value={kind} onChange={(e) => (kind = e.target.value as Kind)}>
    {#each ['default', 'warning', 'danger', 'tertiary'] as const as k}
      <Radio value={k}>
        <span style="color: {labelColor[k]}">{k}</span>
      </Radio>
    {/each}
  </RadioGroup>

  <Popconfirm
    {visible}
    trigger="custom"
    title="确定是否要保存此修改？"
    content="此修改将不可逆"
    okType={okType[kind]}
    onVisibleChange={(v) => (visible = v)}
  >
    {#snippet icon()}
      <IconAlertTriangle size="extra-large" style="color: {iconColor[kind]}" />
    {/snippet}
    <Button onclick={() => (visible = !visible)}>点击此处</Button>
  </Popconfirm>
</div>
