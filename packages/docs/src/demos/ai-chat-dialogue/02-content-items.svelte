<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';

  const roleConfig: AIDialogueRoleConfig = {
    user: { name: '我', color: '#4080ff' },
    assistant: { name: '助手', color: '#00b42a' },
  };

  // 展示消息展示覆盖的完整 ContentItem 谱系（对齐 Semi「消息展示」demo）：
  // 普通文本、用户输入的 input_text/input_image/input_file 组合、
  // 助手的 reasoning、message(output_text + annotations)、function_call、
  // 以及分步展示（Semi demo 用自定义类型 plan + renderDialogueContentItem 接到内部 Step widget；
  // 本库把该 widget 落成原生 ContentItem 类型 steps，直接传入即可分步渲染，无需自定义渲染映射）。
  const chats: AIDialogueMessage[] = [
    {
      id: '1',
      role: 'assistant',
      content: '普通文本',
      status: 'completed',
    },
    {
      id: '2',
      role: 'user',
      content: [
        {
          type: 'message',
          content: [
            { type: 'input_text', text: '帮我生成类似的图片' },
            {
              type: 'input_image',
              image_url:
                'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/root-web-sites/edit-bag.jpeg',
              file_id: 'demo-file-id',
            },
            { type: 'input_text', text: '以下是文件展示' },
            { type: 'input_file', file_url: 'https://www.semi.pdf', filename: 'semi.pdf', size: '100KB' },
            { type: 'input_file', file_url: 'https://www.semi.json', filename: 'semi.json', size: '100KB' },
            { type: 'input_file', file_url: 'https://www.semi.docx', filename: 'semi.docx', size: '100KB' },
          ],
        },
      ],
      status: 'completed',
    },
    {
      id: '3',
      role: 'assistant',
      content: [
        {
          type: 'reasoning',
          status: 'completed',
          summary: [{ type: 'summary_text', text: '我需要思考并回答用户关于什么是 Semi 组件库的问题...' }],
        },
        {
          type: 'message',
          content: [{ type: 'output_text', text: 'Semi Design 是由抖音前端团队和 MED 产品设计团队设计、开发并维护的设计系统。' }],
          status: 'completed',
        },
        {
          id: 'fc_12345xyz',
          call_id: 'call_12345xyz',
          type: 'function_call',
          name: 'get_weather',
          status: 'completed',
          arguments: '{"location":"Paris, France"}',
        },
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: '恭喜你，你已经掌握了 Semi Design 的所有知识！',
              annotations: [
                {
                  type: 'url_citation',
                  url_citation: { title: 'semi.design', url: 'https://semi.design/' },
                },
                {
                  type: 'url_citation',
                  url_citation: { title: 'semi.design', url: 'https://semi.design/' },
                },
              ],
            },
          ],
        },
        {
          type: 'steps',
          steps: [
            {
              summary: '创建一份全面的北京旅游攻略，包含景点、住宿、交通、美食和实用旅行建议',
              status: 'completed',
              actions: [
                { summary: '搜索北京旅游景点介绍及门票信息', description: '正在搜索: 北京旅游景点介绍及门票信息' },
                { summary: '读取指定文件的指定行内容', description: '正在创建文档: 北京旅游攻略' },
                { summary: '创建包含北京旅游攻略的文件', description: '正在创建代码文件: beijing_travel_guide.html' },
              ],
            },
            {
              summary: '总结北京旅游攻略的创建成果并呈现给用户',
              status: 'in_progress',
              actions: [],
            },
          ],
        },
      ],
      status: 'completed',
    },
  ];
</script>

<div style="height: 480px; border: 1px solid var(--cd-color-border); border-radius: 8px; overflow: auto;">
  <AIChatDialogue {chats} {roleConfig} />
</div>
