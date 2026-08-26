<script lang="ts">
  import { AIChatDialogue, responseToMessage } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig, OpenAIResponseObject } from '@chenzy-design/svelte';

  // 严格对齐 Semi 官方「消息数据转换」demo（content/ai/aiChatDialogue/index.md:1315+）：
  // Response API 非流式返回，output 依次是 reasoning → message（带 annotations）→
  // function_call 三个块，responseToMessage 把整个 output 原样塞进 content。
  const roleConfig: AIDialogueRoleConfig = {
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

  const RESPONSE_DATA: OpenAIResponseObject = {
    id: 'resp_67ccd3a9da748190baa7f1570fe91ac604becb25c45c1d41',
    object: 'response',
    created_at: 1741476777,
    status: 'completed',
    error: null,
    incomplete_details: null,
    instructions: null,
    max_output_tokens: null,
    model: 'gpt-4o-2024-08-06',
    output: [
      {
        id: 'rs_6876cf02e0bc8192b74af0fb64b715ff06fa2fcced15a5ac',
        type: 'reasoning',
        status: 'completed',
        summary: [
          {
            type: 'summary_text',
            text: '**用户询问什么是 Semi Design** 用户问 "Semi Design"需整合多源信息。首先发现抖音的 Semi Design 是设计系统，支持多平台且含 Design Token 和代码转换工具。印度 Semi Design 专注半导体培训，但用户可能更关注抖音案例。其他结果涉及半定制设计，但关联性较低。需确认是否有其他解释，但当前信息已覆盖主要维度。虽然继续推理可能提高完备性，但现阶段已足够支撑答案，可以开始输出给用户。',
          },
        ],
      },
      {
        type: 'message',
        id: 'msg_67ccd3acc8d48190a77525dc6de64b4104becb25c45c1d41',
        status: 'completed',
        role: 'assistant',
        content: [
          {
            type: 'output_text',
            text: 'Semi Design 是由抖音前端团队和MED产品设计团队设计、开发并维护的设计系统',
            annotations: [
              {
                title: 'Semi Design',
                url: 'https://semi.design/zh-CN/start/getting-started',
                detail: 'Semi Design 快速开始',
                logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
              },
              {
                title: 'Semi Design',
                url: 'https://semi.design/zh-CN/start/getting-started',
                detail: 'Semi Design 快速开始',
                logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
              },
              {
                title: 'Semi Design',
                url: 'https://semi.design/zh-CN/start/getting-started',
                detail: 'Semi Design 快速开始',
                logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
              },
            ],
          },
        ],
      },
      {
        id: 'fc_12345xyz',
        call_id: 'call_12345xyz',
        type: 'function_call',
        name: 'get_semi_page',
        status: 'completed',
        arguments: '{"pageName":"AIChatDialogue"}',
      },
    ],
  } as unknown as OpenAIResponseObject;

  let chats = $state<AIDialogueMessage[]>([responseToMessage(RESPONSE_DATA)]);

  function onChatsChange(next: AIDialogueMessage[]): void {
    chats = next;
  }
</script>

<div style="height: 320px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue align="leftRight" mode="bubble" {chats} {roleConfig} {onChatsChange} />
</div>
