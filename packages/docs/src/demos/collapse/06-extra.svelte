<script lang="ts">
  import { Collapse, Tag } from '@chenzy-design/svelte';
</script>

{#snippet copyIcon()}
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M9 3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H9Zm0 2h8v10H9V5ZM5 7a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h9a1 1 0 1 0 0-2H6V8a1 1 0 0 0-1-1Z" />
  </svg>
{/snippet}
{#snippet recommended()}
  <Tag color="blue" style="margin: 0;">Recommended</Tag>
{/snippet}

<Collapse>
  <Collapse.Panel header="This is panel header 1" itemKey="1" extra="1234">
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 2" itemKey="2" extra={copyIcon}>
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
  <Collapse.Panel header="This is panel header 3" itemKey="3" extra={recommended}>
    <p>Hi, bytedance dance dance. This is the docsite of chenzy-design.</p>
  </Collapse.Panel>
</Collapse>
