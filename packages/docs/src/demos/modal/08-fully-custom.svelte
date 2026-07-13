<script lang="ts">
  import { Modal, Button, List, ListItem } from '@chenzy-design/svelte';
  import { IconApps, IconBell } from '@chenzy-design/icons';

  let visible = $state(false);

  const data = [
    { title: 'Boost new feature adoption with Integration', content: 'Sample data is prepared for you to demonstrate how Integration may be useful for your team' },
    { title: 'Introducing Dark Mode', content: 'Sample data is prepared for you to demonstrate how Integration may be useful for your team' },
    { title: 'New List Component', content: 'Sample data is prepared for you to demonstrate how Integration may be useful for your team' },
  ];
  const btnStyle = 'width: 240px; margin: 4px 50px;';
</script>

<Button onclick={() => (visible = true)}>自定义对话框</Button>
<Modal
  header={null}
  {visible}
  onOk={() => (visible = false)}
  onCancel={() => (visible = false)}
>
  {#snippet footer()}
    <div style="text-align: center;">
      <Button type="primary" theme="solid" style={btnStyle} onclick={() => (visible = false)}>Continue</Button>
      <Button type="primary" theme="borderless" style={btnStyle} onclick={() => (visible = false)}>Learn more features</Button>
    </div>
  {/snippet}

  <h3 style="text-align: center; font-size: 24px; margin: 40px;">chenzy-design New Features</h3>
  <List dataSource={data}>
    {#snippet renderItem(item)}
      <ListItem>
        {#snippet header()}
          {#if item.title.includes('List')}<IconApps size="extra-large" />{:else}<IconBell size="extra-large" />{/if}
        {/snippet}
        {#snippet main()}
          <div>
            <h6 style="margin: 0; font-size: 16px;">{item.title}</h6>
            <p style="margin-top: 4px; color: var(--cd-color-text-1);">{item.content}</p>
          </div>
        {/snippet}
      </ListItem>
    {/snippet}
  </List>
</Modal>
