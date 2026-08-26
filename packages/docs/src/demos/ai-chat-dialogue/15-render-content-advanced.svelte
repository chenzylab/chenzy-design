<script lang="ts">
  import { AIChatDialogue, MarkdownRender, Toast } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ContentItem,
    AnnotationItem,
  } from '@chenzy-design/svelte';

  // 对齐 Semi 官方「自定义渲染消息内容」demo（content/ai/aiChatDialogue/index.md:926+）：
  // 演示 renderDialogueContentItem 更完整的用法——
  //   function_call 二级映射（按 item.name 精确匹配）；
  //   input_text 一级映射，回调签名 (item, message) 按 message.role 分支渲染不同样式；
  //   reasoning 一级映射，用 AIChatDialogueReasoning 的 customRenderer 读取
  //     item.annotations（reasoning ContentItem 上消费方自定义挂的扩展字段，
  //     不是 Semi ReasoningWidgetProps 类型声明的字段，靠展开传参透传）；
  //   default 键同样是 (text, message) 两参数，按角色分支。
  // 本库原来 renderDialogueContentItem 所有渲染器都只有单参数（item），且
  // AIChatDialogueReasoning.customRenderer 只传精简过的 { status, text }，读不到
  // annotations，都无法照抄这份官方 demo 的写法——现已补齐两参数签名与完整 props 透传。
  const roleConfig: AIDialogueRoleConfig = {
    user: {
      name: '我',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: '助手',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
    system: {
      name: 'System',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
  };

  let chats = $state<AIDialogueMessage[]>([
    { id: '1', role: 'user', content: '你好' },
    { id: '2', role: 'assistant', content: '你好呀，请问有什么可以帮助你的吗~', status: 'completed' },
    {
      id: '3',
      role: 'user',
      content: [
        {
          type: 'message',
          role: 'user',
          content: [
            { type: 'input_text', text: '帮我生成类似的图片' },
            {
              type: 'input_image',
              image_url:
                'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/edit-bag.jpeg',
              file_id: 'demo-file-id',
            },
            {
              type: 'input_image',
              image_url:
                'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/edit-bag.jpeg',
              file_id: 'demo-file-id',
            },
          ],
        },
      ],
    },
    {
      id: '4',
      role: 'assistant',
      content: [
        {
          type: 'reasoning',
          summary: [
            {
              type: 'summary_text',
              text: '\n用户问需要我帮助他生成类似图片，我需要先分析图片内容，然后生成类似的图片...',
            },
          ],
          annotations: [
            {
              title: 'semi.design',
              url: 'https://semi.design/',
              detail: 'semi design page',
              logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
            },
            {
              title: 'semi.design',
              url: 'https://semi.design/',
              detail: 'semi design page',
              logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
            },
          ],
          status: 'completed',
        },
        {
          type: 'function_call',
          name: 'create_travel_guide',
          arguments: '{\n"city": "北京"\n}',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
  ]);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }

  function argsOf(item: ContentItem): string {
    return (item as { arguments?: string }).arguments ?? '';
  }
  function nameOf(item: ContentItem): string {
    return (item as { name?: string }).name ?? 'tool';
  }
  function textOf(item: ContentItem): string {
    return (item as { text?: string }).text ?? '';
  }
</script>

<div style="height: 460px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue
    {chats}
    {roleConfig}
    {onChatsChange}
    renderDialogueContentItem={{
      function_call: { create_travel_guide: travelGuideBlock },
      input_text: inputTextBlock,
      reasoning: reasoningBlock,
      default: defaultBlock,
    }}
  />
</div>

{#snippet travelGuideBlock(item: ContentItem)}
  <div
    style="background:var(--cd-color-fill-1); padding:6px 16px; border-radius:25px;"
  >
    Function Tool Call: {nameOf(item)} {argsOf(item)}
  </div>
{/snippet}

<!-- input_text 一级映射：签名 (item, message) 两参数，按 message.role 分支渲染
     不同气泡样式（对齐 Semi demo）。 -->
{#snippet inputTextBlock(item: ContentItem, message: AIDialogueMessage)}
  {#if message.role === 'user'}
    <!-- class="userTextStyle" 对齐 Semi demo 源码本身写了这个类名（虽然 demo 片段里
         没有配套定义样式，视觉上不生效，纯粹是源码里存在的标记）。 -->
    <div
      class="userTextStyle"
      style="background:var(--cd-color-fill-1); color:var(--cd-color-text-0); border-radius:25px; padding:6px 16px;"
    >
      {textOf(item)}
    </div>
  {:else}
    <div style="color:var(--cd-color-text-0); padding:6px 16px;">{textOf(item)}</div>
  {/if}
{/snippet}

<!-- reasoning 一级映射：把 item 展开传给 AIChatDialogueReasoning，customRenderer
     读取 item.annotations（消费方数据自带的扩展字段，靠透传拿到）。 -->
{#snippet reasoningBlock(item: ContentItem)}
  <AIChatDialogue.Reasoning {...item as Record<string, unknown>} customRenderer={reasoningContent} />
{/snippet}

{#snippet reasoningContent(props: {
  summary?: unknown;
  annotations?: unknown;
  markdownRenderProps?: Record<string, unknown>;
})}
  <AIChatDialogue.Annotation
    annotation={(props.annotations ?? []) as AnnotationItem[]}
    description="参考资料"
    maxCount={3}
    onClick={(e) => {
      e?.stopPropagation();
      Toast.success('Ready to open the sidebar!');
    }}
  />
  <div style="margin-top:8px;">
    <MarkdownRender
      format="md"
      raw={(props.summary as { text?: string }[] | undefined)?.[0]?.text ?? ''}
      {...props.markdownRenderProps}
    />
  </div>
{/snippet}

<!-- default 键：签名 (text, message) 两参数，按角色分支（对齐 Semi demo）。 -->
{#snippet defaultBlock(text: string, message: AIDialogueMessage)}
  {#if message.role === 'user'}
    <div
      class="userTextStyle"
      style="background:var(--cd-color-fill-1); color:var(--cd-color-text-0); border-radius:25px; padding:6px 16px;"
    >
      {text}
    </div>
  {:else}
    <div style="color:var(--cd-color-text-0); padding:6px 16px;">{text}</div>
  {/if}
{/snippet}
