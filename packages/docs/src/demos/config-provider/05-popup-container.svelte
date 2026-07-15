<script lang="ts">
  import { ConfigProvider, Button, Dropdown, Text } from '@chenzy-design/svelte';

  let host = $state<HTMLElement | null>(null);
</script>

<Text type="tertiary"
  >getPopupContainer 经 context 提供全局默认浮层容器；Dropdown 等浮层组件未传自身
  getPopupContainer 时，统一 portal 到此宿主（而非 <code>document.body</code>）。</Text
>

<div
  bind:this={host}
  style="position:relative; margin-top:12px; padding:16px; border:1px dashed var(--cd-color-border); border-radius:8px"
>
  <Text type="tertiary">浮层挂载宿主（下方菜单将 portal 进这里）：</Text>
  <div style="margin-top:12px">
    <ConfigProvider getPopupContainer={() => host ?? document.body}>
      <Dropdown
        menu={[
          { node: 'item', name: '选项 A', key: 'a' },
          { node: 'item', name: '选项 B', key: 'b' },
        ]}
        trigger="click"
      >
        <Button>打开菜单</Button>
      </Dropdown>
    </ConfigProvider>
  </div>
</div>
