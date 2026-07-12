<script lang="ts">
  import { Collapse } from '@chenzy-design/svelte';
</script>

{#snippet plus()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z" />
  </svg>
{/snippet}
{#snippet minus()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M5 11a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5Z" />
  </svg>
{/snippet}

<Collapse expandIcon={plus} collapseIcon={minus}>
  <Collapse.Panel header="This is panel header 1" itemKey="1">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
</Collapse>
