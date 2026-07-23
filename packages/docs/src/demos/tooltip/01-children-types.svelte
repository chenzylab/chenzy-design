<script lang="ts">
  import { Tooltip, Space } from '@chenzy-design/svelte';
  import FunctionalComponent from './_functional-component.svelte';
  import ClassComponent from './_class-component.svelte';

  const style =
    'border: 2px solid var(--cd-color-border); padding-left: 4px; padding-right: 4px; border-radius: 4px;';
</script>

<Space>
  <Tooltip content="semi design">
    <FunctionalComponent {style} />
  </Tooltip>
  <Tooltip content="semi design">
    <ClassComponent {style} />
  </Tooltip>
  <Tooltip content="semi design">
    <span {style}>DOM</span>
  </Tooltip>
</Space>
