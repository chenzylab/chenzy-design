<script lang="ts">
  import { Modal, Button, Space } from '@chenzy-design/svelte';
  import { sendSvg } from '@chenzy-design/icons';

  const info = () => Modal.info({ title: 'Here is some info', content: 'bla bla bla...' });
  const success = () => Modal.success({ title: 'This is a success message', content: 'bla bla bla...' });
  const error = () => Modal.error({ title: 'Unfortunately, there is an error', content: 'bla bla bla...' });
  const warning = () => Modal.warning({ title: 'Warning: be cautious ahead', content: 'bla bla bla...' });
  const confirm = () => Modal.confirm({ title: 'Are you sure ?', content: 'bla bla bla...' });
  const custom = () =>
    Modal.info({
      title: 'This is a custom modal',
      content: 'bla bla bla...',
      icon: sendSvg,
      cancelButtonProps: { theme: 'borderless' },
      okButtonProps: { theme: 'solid' },
    });
</script>

<Space vertical align="start">
  <Button onclick={info}>Info</Button>
  <Button onclick={success}>Success</Button>
  <Button type="danger" onclick={error}>Error</Button>
  <Button type="warning" onclick={warning}>Warning</Button>
  <Button type="primary" onclick={confirm}>Confirm</Button>
  <Button onclick={custom}>Custom</Button>
</Space>
