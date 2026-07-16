<script lang="ts">
  import { Checkbox, CheckboxGroup } from '@chenzy-design/svelte';

  const options = ['摄影', '电影', '跑步'];
  let checkedList = $state<(string | number)[]>(['摄影', '跑步']);

  const indeterminate = $derived(
    checkedList.length > 0 && checkedList.length < options.length,
  );
  const checkAll = $derived(checkedList.length === options.length);

  function onCheckAll(e: { target: { checked: boolean } }) {
    checkedList = e.target.checked ? [...options] : [];
  }
</script>

<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
  <!-- 全选：indeterminate 表达部分选中，checkAll 一键全选/清空 -->
  <div style="padding-bottom:8px;border-bottom:1px solid var(--cd-color-border)">
    <Checkbox
      checked={checkAll}
      {indeterminate}
      onChange={onCheckAll}
    >
      全选
    </Checkbox>
  </div>
  <CheckboxGroup
    direction="horizontal"
    value={checkedList}
    options={options}
    onChange={(v) => (checkedList = v)}
  />
</div>
