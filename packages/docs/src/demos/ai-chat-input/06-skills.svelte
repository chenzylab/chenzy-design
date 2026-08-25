<script lang="ts">
  // 严格对齐 Semi「技能及模版」demo：帮我写作（hasTemplate）+ AI coding 两个技能；
  // renderConfigureArea 放模型选择器；renderTemplate 渲染分组 Tab + 卡片网格的模版面板，
  // 卡片正文用 input-slot/select-slot 内联可编辑标签，点击卡片把内容填入编辑器。
  import { AIChatInput } from '@chenzy-design/svelte';
  import type { AIChatInputSkill, AIChatInputMessageContent } from '@chenzy-design/svelte';
  import { IconTemplateStroked, IconSearch } from '@chenzy-design/icons';

  const modelOptions = [
    { value: 'GPT-5', label: 'GPT-5' },
    { value: 'GPT-4o', label: 'GPT-4o' },
    { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
  ];

  const skills: AIChatInputSkill[] = [
    { icon: iconTemplate, value: 'writing', label: '帮我写作', hasTemplate: true },
    { icon: iconSearch, value: 'AI 编程', label: 'AI coding' },
  ];

  interface TemplateItem {
    bg: string;
    title: string;
    desc: string;
    content: string;
  }
  interface TemplateGroup {
    groupKey: string;
    group: string;
    children: TemplateItem[];
  }

  const template: TemplateGroup[] = [
    {
      groupKey: 'value',
      group: '工作',
      children: [
        {
          bg: 'var(--cd-color-primary)',
          title: '总结汇报',
          desc: '凝练你的工作成效',
          content:
            '我的职业是<input-slot placeholder="[请输入职业]"></input-slot>，帮我写一份关于<input-slot placeholder="[输入目的：项目进展总结、团队工作成果或其他]"></input-slot>的总结汇报',
        },
        {
          bg: 'var(--cd-color-warning)',
          title: '话术',
          desc: '满足不同场景表达需求',
          content:
            '我是一名<select-slot value="打工人" options=\'["打工人","学生"]\'></select-slot> ，帮我写一段面向<input-slot placeholder="[输入对象]">陌生同事</input-slot>的话术内容',
        },
      ],
    },
    {
      groupKey: 'marketing',
      group: '商业营销',
      children: [
        {
          bg: 'var(--cd-color-primary)',
          title: '宣传文案',
          desc: '撰写各平台的推广文案',
          content:
            '帮我写一篇面向<input-slot placeholder="[输入目标人群]"></input-slot>职场人士，关于<input-slot placeholder="[输入产品]"></input-slot>的宣传文案，需要直击痛点，吸引用户点击。',
        },
        {
          bg: 'var(--cd-color-warning)',
          title: '方案策划',
          desc: '量身定制各种方案',
          content:
            '我是一名<input-slot placeholder="[输入职业]"></input-slot>职业策划人 ，帮我写一个<input-slot placeholder="[方案类型：如线下读书会活动方案等]"></input-slot>线下读书会活动 的方案，需要包含但不限于策划目标、详细计划、所需资源和预算、效果评估、风险应对等。',
        },
      ],
    },
  ];

  let groupIndex = $state(0);

  function handleSend(): void {
    // demo 无需处理发送结果，仅用于演示配置区域 + 技能 + 模版闭环。
  }
</script>

{#snippet iconTemplate()}<IconTemplateStroked />{/snippet}
{#snippet iconSearch()}<IconSearch />{/snippet}

<div style="margin: 12px;">
  <AIChatInput
    placeholder="输入 / 唤起技能，选择技能后，点击模版按钮可查看模版，可通过鼠标上下按键切换侯选项"
    {skills}
    skillHotKey="/"
    onMessageSend={handleSend}
  >
    {#snippet renderConfigureArea()}
      <AIChatInput.Configure.Select field="model" options={modelOptions} initValue="GPT-4o" />
    {/snippet}
    {#snippet renderTemplate({ skill, setContent })}
      {#if skill.value === 'writing'}
        <div class="ai-chat-input-template">
          <div class="template-header">
            {#each template as group, i (group.groupKey)}
              <div
                class="template-header-item"
                class:template-header-item-active={groupIndex === i}
                onclick={() => (groupIndex = i)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    groupIndex = i;
                  }
                }}
                role="tab"
                tabindex="0"
                aria-selected={groupIndex === i}
              >
                {group.group}
              </div>
            {/each}
          </div>
          <div class="template-content">
            {#each template[groupIndex]?.children ?? [] as item (item.title)}
              <div
                class="template-content-item"
                onclick={() => setContent(item.content)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setContent(item.content);
                  }
                }}
                role="button"
                tabindex="0"
              >
                <div class="template-content-item-icon" style="background: {item.bg};">
                  <IconTemplateStroked />
                </div>
                <div class="template-content-item-title">{item.title}</div>
                <div class="template-content-item-desc">{item.desc}</div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/snippet}
  </AIChatInput>
</div>

<style>
  /* 严格对齐 Semi src/styles/docDemo.scss 的 .aiChatInput-template：官网文档站自己的
     模版面板样式补丁（分组 Tab + 卡片网格），不属于组件库内置能力，demo 文件承担
     等价角色（同 07b-configure-item.svelte 的 Cascader 补丁归属判断）。 */
  .ai-chat-input-template {
    width: 100%;
    padding: 14px 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }

  .template-header {
    height: 40px;
    display: flex;
    flex-direction: row;
    column-gap: 8px;
  }

  .template-header-item {
    cursor: pointer;
    line-height: 22px;
    height: 32px;
    box-sizing: border-box;
    font-size: 14px;
    padding: 4px 16px;
    border-radius: 10px;
    color: var(--cd-color-text-2);
    background: var(--cd-color-bg-0);
  }

  .template-header-item-active {
    font-weight: 600;
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-0);
  }

  .template-content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: 12px;
    row-gap: 12px;
    flex-shrink: 1;
    overflow: scroll;
  }

  .template-content-item {
    box-sizing: border-box;
    width: 23%;
    border-radius: 16px;
    background: var(--cd-color-white);
    border: 1px solid var(--cd-color-border);
    display: flex;
    flex-direction: column;
    padding: 16px;
    row-gap: 8px;
    cursor: pointer;
  }

  .template-content-item:hover {
    background: var(--cd-color-fill-0);
  }

  .template-content-item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    color: var(--cd-color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
  }

  .template-content-item-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--cd-color-text-0);
  }

  .template-content-item-desc {
    font-size: 13px;
    font-weight: 400;
    color: var(--cd-color-text-1);
  }
</style>
