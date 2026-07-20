<script lang="ts">
  import { Checkbox, CheckboxGroup } from '@chenzy-design/svelte';

  const plainOptions = ['Photography', 'Movies', 'Running'];
  let checkedList = $state<(string | number)[]>(['Photography', 'Running']);
  let indeterminate = $state(true);
  let checkAll = $state(false);

  function onChange(list: (string | number)[]) {
    checkedList = list;
    indeterminate = !!list.length && list.length < plainOptions.length;
    checkAll = list.length === plainOptions.length;
  }

  function onCheckAllChange(e: { target: { checked: boolean } }) {
    console.log(e);
    checkedList = e.target.checked ? [...plainOptions] : [];
    indeterminate = false;
    checkAll = e.target.checked;
  }
</script>

<div>
  <div style="padding-bottom: 8px; border-bottom: 1px solid var(--cd-color-border);">
    <Checkbox {indeterminate} onChange={onCheckAllChange} checked={checkAll} ariaLabel="Checkbox 示例">
      Check all
    </Checkbox>
  </div>
  <CheckboxGroup
    style="margin-top: 6px;"
    options={plainOptions}
    value={checkedList}
    {onChange}
    ariaLabel="CheckboxGroup 示例"
  />
</div>
