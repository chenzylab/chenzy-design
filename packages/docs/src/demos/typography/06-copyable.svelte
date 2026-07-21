<script lang="ts">
  import { Typography, Button, TextArea, Toast } from '@chenzy-design/svelte';
  import { IconSetting } from '@chenzy-design/icons';

  const { Paragraph, Text, Numeral } = Typography;

  const timestamp = new Date().getTime() / 1000;
</script>

<div>
  <Paragraph copyable>点击右边的图标复制文本。</Paragraph>
  <Paragraph copyable={{ content: 'Hello, chenzy Design!' }}>点击复制文本。</Paragraph>
  <Paragraph copyable={{ onCopy: () => Toast.success({ content: '复制文本成功' }) }}>
    点击右边的图标复制文本。
  </Paragraph>
  <div>
    时间戳: <Numeral truncate="ceil" copyable underline>{`${timestamp}s`}</Numeral>
  </div>
  <Paragraph copyable={{ icon: settingIcon }}>自定义复制节点</Paragraph>
  <Paragraph
    copyable={{
      content: 'Custom render!',
      render: customRender,
    }}
  >
    自定义复制渲染
  </Paragraph>
  <br />
  <br />
  <Text type="secondary">粘贴区域：</Text>
  <br />
  <TextArea autosize style="width: 320px; margin-top: 4px;" rows={3} />
</div>

{#snippet settingIcon()}<IconSetting style="color: var(--cd-color-link);" />{/snippet}

{#snippet customRender(copied: boolean, doCopy: (e: MouseEvent) => void, config: { content?: string })}
  <Button size="small" onclick={doCopy}>
    <span>{copied ? '复制成功' : `点击复制:${config.content}`}</span>
  </Button>
{/snippet}
