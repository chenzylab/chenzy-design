<script lang="ts">
  import { AIChatDialogue } from '@chenzy-design/svelte';
  import type {
    AIDialogueMessage,
    AIDialogueRoleConfig,
    ContentItem,
  } from '@chenzy-design/svelte';
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

  // 对齐 Semi 官方「消息展示」demo 的另一种分步写法：Semi 的 MESSAGE_ITEM_TYPE 常量表
  // 里定义了 STEPS，但 dialogueContent.tsx 内置渲染分发从未消费它——Semi 官方 demo 实际
  // 展示分步能力走的是完全自定义的类型名（demo 用 'plan'）+ renderDialogueContentItem +
  // AIChatDialogue.Step 静态子组件手动接线。本库两条路径都支持：02-content-items.svelte
  // 演示的是内置 type:'steps'（不接线也能直接用）；这里演示 Semi 官方那套自定义类型写法，
  // 说明 renderDialogueContentItem 命中时优先于内置分支，可以完全接管任意自定义类型名。
  const chats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: '帮我做一份北京旅游攻略',
      status: 'completed',
    },
    {
      id: 'a1',
      role: 'assistant',
      content: [
        {
          // 自定义类型名，不是内置的 ContentItem 类型——完全由 renderDialogueContentItem
          // 接管渲染，本库内部不识别 'plan' 这个字符串。
          type: 'plan',
          content: [
            {
              summary: '创建一份全面的北京旅游攻略，包含景点、住宿、交通、美食和实用旅行建议',
              steps: [
                {
                  summary: '搜索北京旅游景点介绍及门票信息',
                  description: '正在搜索: 北京旅游景点介绍及门票信息',
                  type: 'search',
                },
                {
                  summary: '读取指定文件的指定行内容',
                  description: '正在创建文档: 北京旅游攻略',
                  type: 'docs',
                },
                {
                  summary: '创建包含北京旅游攻略的文件',
                  description: '正在创建代码文件: beijing_travel_guide.html',
                  type: 'code',
                },
              ],
            },
            {
              summary: '总结北京旅游攻略的创建成果并呈现给用户',
              steps: [],
            },
          ],
        },
      ],
      status: 'completed',
    },
  ];

  // 对齐 Semi demo 的 mapStep：按自定义数据里的 type 字段映射成图标，
  // 拼成 AIChatDialogue.Step 需要的 steps/actions 结构（summary/status/actions）。
  interface PlanStep {
    summary?: string;
    steps?: { summary?: string; description?: string; type?: string }[];
  }

  function planOf(item: ContentItem): PlanStep[] {
    const content = (item as { content?: PlanStep[] }).content;
    return Array.isArray(content) ? content : [];
  }
</script>

<!-- renderDialogueContentItem 命中自定义类型 'plan'，完全接管渲染：自己拼 steps 结构，
     手动渲染出 AIChatDialogue.Step（本库静态子组件导出，对齐 Semi AIChatDialogue.Step）。 -->
<div style="height: 420px; border: 1px solid var(--cd-color-border); border-radius: 8px;">
  <AIChatDialogue {chats} {roleConfig} renderDialogueContentItem={{ plan: planBlock }} />
</div>

{#snippet planBlock(item: ContentItem)}
  {#each planOf(item) as plan, i (i)}
    <AIChatDialogue.Step
      steps={[
        {
          summary: plan.summary,
          status: 'completed',
          actions: (plan.steps ?? []).map((s) => ({
            summary: s.summary,
            description: s.description,
            icon: s.type,
          })),
        },
      ]}
    >
      {#snippet renderActionIcon({ icon }: { icon: unknown })}
        {#if icon === 'search'}<IconSearchStroked />
        {:else if icon === 'docs'}<IconBriefStroked />
        {:else if icon === 'code'}<IconCodeStroked />{/if}
      {/snippet}
    </AIChatDialogue.Step>
  {/each}
{/snippet}
