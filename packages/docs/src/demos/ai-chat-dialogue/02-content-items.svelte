<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/svelte';
  import { IconSearchStroked, IconBriefStroked, IconCodeStroked } from '@chenzy-design/icons';

  // avatar 对齐 Semi demo（roleConfig 各角色均配真实头像图片）。
  const roleConfig: AIDialogueRoleConfig = {
    user: {
      name: '我',
      color: '#4080ff',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png',
    },
    assistant: {
      name: '助手',
      color: '#00b42a',
      avatar: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
    },
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
              // annotations 是扁平结构（对齐 Semi demo：title/url/logo 直接同级），本库
              // AnnotationWidget 直接读 item.logo/item.title——本库原来写成
              // { type, url_citation: { title, url } } 嵌套结构，组件读不到任何字段，
              // 真机验证到头像组渲染为空、标题也是 undefined，只有「N 篇资料」这行文案生效。
              annotations: [
                {
                  title: 'semi.design',
                  url: 'https://semi.design/',
                  logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
                },
                {
                  title: 'semi.design',
                  url: 'https://semi.design/',
                  logo: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/logo.png',
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
              // icon 按 action 类型分派（对齐 Semi mapStep：search→IconSearchStroked，
              // docs→IconBriefStroked，code→IconCodeStroked）。Semi 的 action.icon
              // 直接是 ReactNode，数据里塞组件实例；本库无该能力，用 __iconType 自定义字段
              // 标记类型，配合 renderActionIcon snippet 在渲染层映射成对应图标。
              actions: [
                {
                  summary: '搜索北京旅游景点介绍及门票信息',
                  description: '正在搜索: 北京旅游景点介绍及门票信息',
                  icon: 'search',
                },
                {
                  summary: '读取指定文件的指定行内容',
                  description: '正在创建文档: 北京旅游攻略',
                  icon: 'docs',
                },
                {
                  summary: '创建包含北京旅游攻略的文件',
                  description: '正在创建代码文件: beijing_travel_guide.html',
                  icon: 'code',
                },
              ],
            },
            {
              summary: '总结北京旅游攻略的创建成果并呈现给用户',
              status: 'completed',
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
  <AIChatDialogue {chats} {roleConfig}>
    {#snippet renderActionIcon({ icon })}
      {#if icon === 'search'}<IconSearchStroked />
      {:else if icon === 'docs'}<IconBriefStroked />
      {:else if icon === 'code'}<IconCodeStroked />{/if}
    {/snippet}
  </AIChatDialogue>
</div>
