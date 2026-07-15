<script lang="ts">
  import { Typography, Button } from '@chenzy-design/svelte';

  const { Paragraph } = Typography;

  let copiedCount = $state(0);

  function handleCopy(_e: MouseEvent, content: string, res: boolean): void {
    if (res) copiedCount += 1;
    // eslint-disable-next-line no-console
    console.log('copied:', content, res);
  }
</script>

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 480px;">
  <Paragraph copyable>点击右边的图标复制文本。</Paragraph>
  <Paragraph copyable={{ content: 'Hello, chenzy Design!' }}>点击复制自定义内容。</Paragraph>
  <Paragraph copyable={{ onCopy: handleCopy }}>
    点击右边的图标复制文本并触发回调（已复制 {copiedCount} 次）。
  </Paragraph>
  <Paragraph copyable={{ icon: settingIcon }}>自定义复制图标节点</Paragraph>
  <Paragraph
    copyable={{
      content: 'Custom render!',
      render: customRender,
    }}
  >
    自定义复制渲染
  </Paragraph>
</div>

{#snippet settingIcon()}
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--semi-color-link, currentColor)"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    />
  </svg>
{/snippet}

{#snippet customRender(copied: boolean, doCopy: (e: MouseEvent) => void, config: { content?: string })}
  <Button size="small" theme="light" onclick={doCopy}>
    {copied ? '复制成功' : `点击复制:${config.content}`}
  </Button>
{/snippet}
