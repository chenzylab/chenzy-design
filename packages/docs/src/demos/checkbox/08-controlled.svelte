<script lang="ts">
  import { Checkbox, Button } from '@chenzy-design/svelte';

  let checked = $state(true);
  let disabled = $state(false);

  function onChange(e: { target: { checked: boolean } }) {
    console.log('checked = ', e.target.checked);
    checked = e.target.checked;
  }

  const label = $derived(`${checked ? 'Checked' : 'Unchecked'} ${disabled ? 'Disabled' : 'Enabled'}`);
</script>

<div>
  <p style="margin-bottom: 20px;">
    <Checkbox {checked} {disabled} {onChange} ariaLabel="Checkbox 示例">
      {label}
    </Checkbox>
  </p>
  <p>
    <Button type="primary" size="small" onclick={() => (checked = !checked)}>
      {!checked ? 'Check' : 'Uncheck'}
    </Button>
    <Button style="margin-left: 10px;" type="primary" size="small" onclick={() => (disabled = !disabled)}>
      {!disabled ? 'Disable' : 'Enable'}
    </Button>
  </p>
</div>
