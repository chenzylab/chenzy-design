<script lang="ts">
  import { Modal, Button, List, ListItem } from '@chenzy-design/svelte';
  import { IconVigoLogo, IconSemiLogo } from '@chenzy-design/icons';

  let visible = $state(false);
  const showDialog = () => {
    visible = true;
  };
  const handleOk = () => {
    visible = false;
  };
  const handleCancel = () => {
    visible = false;
  };

  // 对齐 Semi：data 每项带 icon 字段（Semi / Vigo / Semi 顺序）。
  const data = [
    {
      icon: 'semi' as const,
      title: 'Boost new feature adoption with Integration',
      content: 'Sample data is prepared for you to demostrate how Integration may be useful for your team',
    },
    {
      icon: 'vigo' as const,
      title: 'Introducing Dark Mode',
      content: 'Sample data is prepared for you to demostrate how Integration may be useful for your team',
    },
    {
      icon: 'semi' as const,
      title: 'New List Component',
      content: 'Sample data is prepared for you to demostrate how Integration may be useful for your team',
    },
  ];
  const btnStyle = 'width: 240px; margin: 4px 50px;';
</script>

<Button onclick={showDialog}>自定义对话框</Button>
<Modal header={null} {visible} onOk={handleOk} onCancel={handleCancel}>
  {#snippet footer()}
    <div style="text-align: center;">
      <Button type="primary" theme="solid" style={btnStyle} onclick={handleOk}>Continue</Button>
      <Button type="primary" theme="borderless" style={btnStyle} onclick={handleCancel}
        >Learn more features</Button
      >
    </div>
  {/snippet}

  <h3 style="text-align: center; font-size: 24px; margin: 40px;">Semi Design New Features</h3>
  <List dataSource={data} split={false}>
    {#snippet renderItem(item)}
      <ListItem>
        {#snippet header()}
          {#if item.icon === 'semi'}<IconSemiLogo style="font-size: 48px;" />{:else}<IconVigoLogo
              style="font-size: 48px;"
            />{/if}
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
