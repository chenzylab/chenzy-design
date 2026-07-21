<script lang="ts">
  import { CheckboxGroup } from '@chenzy-design/svelte';

  const options = [
    { label: 'Call', value: 'abc' },
    { label: 'IM', value: 'c' },
    { label: 'Ticket', value: 'd' },
    { label: 'Offline', value: 'e' },
    { label: 'Buzz', value: 'f' },
  ];
</script>

<div style="border: 1px solid var(--cd-color-border, #e5e7eb); padding: 10px; margin-bottom: 24px;">
  <p style="font-weight: 600; font-size: 16px;">Checkbox Content Demo</p>
  <CheckboxGroup
    {options}
    direction="horizontal"
    ariaLabel="CheckboxGroup 示例"
    style="margin-top: 10px;"
  />
</div>
