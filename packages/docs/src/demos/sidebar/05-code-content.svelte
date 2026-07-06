<script lang="ts">
  import {
    SideBarContainer,
    SideBar,
    SideBarCodeContent,
    Button,
    type CodeItemProps,
  } from '@chenzy-design/svelte';

  let visible = $state(false);
  let activeKey = $state<string[]>(['tool-json']);

  const codes: CodeItemProps[] = [
    {
      key: 'tool-json',
      name: 'tool_call.json',
      isJson: true,
      content: JSON.stringify(
        { name: 'search_web', arguments: { query: 'chenzy-design', top_k: 5 } },
        null,
        2,
      ),
    },
    {
      key: 'handler-ts',
      name: 'handler.ts',
      language: 'typescript',
      content: `export function onToolCall(name: string, args: unknown) {
  console.log('call', name, args);
  return { ok: true };
}`,
    },
  ];
</script>

<Button onclick={() => (visible = true)}>打开代码/JSON 预览</Button>

<SideBarContainer {visible} title="代码预览" onCancel={() => (visible = false)}>
  <SideBar mode="main" renderMainContent={mainContent} />
</SideBarContainer>

{#snippet mainContent()}
  <SideBarCodeContent
    {codes}
    {activeKey}
    onChange={(keys) => (activeKey = keys)}
    onExpand={(_e, code) => console.log('expand', code.key)}
  />
{/snippet}
