<script lang="ts">
  // 严格对齐 Semi「自定义渲染输入框」：renderInputArea 完全接管为 Form 表单
  // （Input + Upload + 提交按钮），通过 onSend(content, attachment) 触发发送。
  import { Chat, Form, FormInput, FormUpload, Button } from '@chenzy-design/svelte';
  import { IconUpload } from '@chenzy-design/icons';
  import type { ChatMessage, ChatRoleConfig, ChatRenderInputAreaProps } from '@chenzy-design/svelte';
  import type { FormApi } from '@chenzy-design/core';

  const roleConfig: ChatRoleConfig = {
    user: {
      name: 'User',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: 'Assistant',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
    system: {
      name: 'System',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  let chats = $state<ChatMessage[]>([
    { role: 'system', id: '1', createAt: 1715676751919, content: "Hello, I'm your AI assistant." },
  ]);

  const uploadProps = { action: 'https://api.semi.design/upload' };

  let seq = 0;
  function onMessageSend(): void {
    setTimeout(() => {
      chats = [...chats, { role: 'assistant', id: `id-${++seq}`, content: 'This is a mock response' }];
    }, 200);
  }

  function onChatsChange(next: ChatMessage[]): void {
    chats = next;
  }

  let formApi: FormApi | undefined;

  function onSubmit(onSend: ChatRenderInputAreaProps['onSend']): void {
    if (!formApi) return;
    const values = formApi.getValues() as { name?: string; file?: unknown[] };
    if ((values.name && values.name.length !== 0) || (values.file && values.file.length !== 0)) {
      onSend?.(values.name ?? '', values.file as never);
      formApi.reset();
    }
  }
</script>

<Chat
  {chats}
  {roleConfig}
  {uploadProps}
  {onChatsChange}
  {onMessageSend}
  renderInputArea={inputAreaSnippet}
  style="height: 500px; border: 1px solid var(--cd-color-border); border-radius: 16px;"
/>

{#snippet inputAreaSnippet({ onSend }: ChatRenderInputAreaProps)}
  <div
    style="display:flex;flex-direction:column;border:1px solid var(--cd-color-border);margin:8px 16px;border-radius:8px;padding:8px;"
  >
    <Form getFormApi={(api) => (formApi = api)}>
      <strong>输入信息</strong>
      <FormInput field="name" label="名称（Input）" style="width:250px;" trigger="blur" />
      <FormUpload field="file" label="文档" action="https://api.semi.design/upload">
        <Button icon={uploadIcon} theme="light">点击上传</Button>
      </FormUpload>
    </Form>
    <Button style="width:fit-content;" onclick={() => onSubmit(onSend)}>提交</Button>
  </div>
{/snippet}

{#snippet uploadIcon()}<IconUpload />{/snippet}
