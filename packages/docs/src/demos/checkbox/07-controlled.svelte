<script lang="ts">
  import { Checkbox, Button } from '@chenzy-design/svelte';

  let checked = $state(true);
  let disabled = $state(false);

  const label = $derived(`${checked ? '已选中' : '未选中'} · ${disabled ? '禁用' : '启用'}`);
</script>

<div style="display:flex;flex-direction:column;gap:16px;align-items:flex-start">
  <!-- 受控：外部持有 checked/disabled，按钮联动切换 -->
  <Checkbox {checked} {disabled} onChange={(e) => (checked = e.target.checked)}>
    {label}
  </Checkbox>
  <div style="display:flex;gap:8px">
    <Button type="primary" size="small" onclick={() => (checked = !checked)}>
      {checked ? '取消选中' : '选中'}
    </Button>
    <Button type="primary" size="small" onclick={() => (disabled = !disabled)}>
      {disabled ? '启用' : '禁用'}
    </Button>
  </div>
</div>
