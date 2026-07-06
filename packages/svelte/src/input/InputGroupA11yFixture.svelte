<script lang="ts">
  import InputGroup from './InputGroup.svelte';
  import Input from './Input.svelte';

  interface Props {
    label?: string;
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
  }
  let { label, size, disabled }: Props = $props();
</script>

<InputGroup
  {...label ? { label } : {}}
  {...size ? { size } : {}}
  {...disabled !== undefined ? { disabled } : {}}
>
  <Input ariaLabel="From" defaultValue="0" />
  <Input ariaLabel="To" defaultValue="100" />
</InputGroup>
