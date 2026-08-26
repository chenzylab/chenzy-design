// AIChatDialogue a11y + 渲染：OpenAI 消息格式对话展示。
//  - 消息流容器 role=log / aria-live=polite / aria-label 走 locale。
//  - ContentItem 分块渲染：output_text→MarkdownRender、reasoning 折叠、function_call 工具块。
//  - 选择模式：checkbox 前置。
//  - axe 0 violations。
// jsdom 断言静态渲染 + ARIA + axe（真实滚动/回到底部留浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { tick } from 'svelte';
import { fireEvent, render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AIChatDialogue from './AIChatDialogue.svelte';
import AIChatDialogueEditFixture from './AIChatDialogueEditFixture.svelte';
import AIChatDialogueCustomRendererFixture from './AIChatDialogueCustomRendererFixture.svelte';
import AIChatDialogueRenderActionFixture from './AIChatDialogueRenderActionFixture.svelte';
import AIChatDialogueInnerRendererFixture from './AIChatDialogueInnerRendererFixture.svelte';
import AIChatDialogueNestedRendererFixture from './AIChatDialogueNestedRendererFixture.svelte';
import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

const roleConfig: AIDialogueRoleConfig = {
  user: { name: '我', color: '#4080ff' },
  assistant: { name: '助手', color: '#00b42a' },
};

// Avatar 根节点恒定带 role="listitem"（对齐 Semi index.tsx 的 <span role='listitem'>，
// 不论是否处于 AvatarGroup/role="list" 语境）。对话消息头像脱离 list 语境单独渲染时
// axe 会报 aria-required-parent——这是 Semi 本身接受的已知 trade-off，非本库回归。
const AXE_OPTIONS = { disableRules: ['aria-required-parent'] };

const chats: AIDialogueMessage[] = [
  {
    id: 'u1',
    role: 'user',
    content: [{ type: 'message', content: [{ type: 'input_text', text: 'hello' }] }],
    status: 'completed',
  },
  {
    id: 'a1',
    role: 'assistant',
    content: [
      { type: 'reasoning', summary: [{ text: 'thinking...' }] },
      { type: 'message', content: [{ type: 'output_text', text: 'Hi there!' }] },
      { type: 'function_call', name: 'get_weather', arguments: '{"city":"SF"}' },
    ],
    status: 'completed',
  },
];

describe('AIChatDialogue a11y / 渲染', () => {
  it('消息流 role=log / aria-live=polite / locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const log = container.querySelector('.cd-ai-chat-dialogue-list');
    expect(log).not.toBeNull();
    expect(log?.getAttribute('role')).toBe('log');
    expect(log?.getAttribute('aria-live')).toBe('polite');
    const label = log?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('AIChatDialogue.messageList');
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });

  it('两条消息各一个 DialogueBox', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper').length).toBe(2);
  });

  it('ContentItem 分块：reasoning 折叠块 + function_call 工具块渲染', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    // 对齐 Semi reasoning.tsx：defaultOpen = status !== 'completed'
    // —— 该 fixture 无 status（思考中），故**默认展开**。本库原来恒为收起。
    const toggle = container.querySelector('.cd-ai-chat-dialogue-reasoning-header');
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    // function_call 工具块名称渲染（Semi 是扁平 div，名称是直接文本，无 -name 子层）。
    const tool = container.querySelector('.cd-ai-chat-dialogue-content-tool-call');
    expect(tool?.textContent).toContain('get_weather');
  });

  it('reasoning 可折叠：点击在展开/收起间切换', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const toggle = container.querySelector('.cd-ai-chat-dialogue-reasoning-header') as HTMLButtonElement;
    // 无 status → 思考中 → 默认展开（见上条用例说明）。
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('.cd-ai-chat-dialogue-reasoning-content')).not.toBeNull();
  });

  // 对齐 Semi：completed 态默认收起，且标题文案走 reasoning.completed（本库原来是单串）。
  it('reasoning status=completed：默认收起 + 标题用 completed 文案', async () => {
    const done: AIDialogueMessage[] = [
      {
        id: 'r1',
        role: 'assistant',
        content: [{ type: 'reasoning', status: 'completed', summary: [{ text: '想好了' }] }],
      },
    ];
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats: done, roleConfig } });
    const toggle = container.querySelector('.cd-ai-chat-dialogue-reasoning-header') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(
      container.querySelector('.cd-ai-chat-dialogue-reasoning-header-title')?.textContent,
    ).toBe('Reasoning completed');
  });

  // Semi 的 header 是 prefix 图标 / title / suffix 箭头 三段；本库原来只有一个裸按钮。
  it('reasoning header 三段结构：prefix + title + suffix', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const header = container.querySelector('.cd-ai-chat-dialogue-reasoning-header')!;
    expect(header.querySelector('.cd-ai-chat-dialogue-reasoning-header-prefix')).not.toBeNull();
    expect(header.querySelector('.cd-ai-chat-dialogue-reasoning-header-title')).not.toBeNull();
    expect(header.querySelector('.cd-ai-chat-dialogue-reasoning-header-suffix')).not.toBeNull();
    // 外框（带边框圆角）也是 Semi 有本库缺的一层。
    expect(container.querySelector('.cd-ai-chat-dialogue-reasoning-wrapper')).not.toBeNull();
  });

  // 注意 -checkbox 与 -wrapper-selected 是两回事（本库原来混为一谈）：
  // 前者是多选框容器（selecting 时每条都有），后者是「本行已选中」的高亮标记。
  it('选择模式：每条消息前置 checkbox 容器，未选中时无 -wrapper-selected', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig, selecting: true },
    });
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-checkbox').length).toBe(2);
    // 复用 Checkbox 组件，故 checkbox 容器里是真实的 input[type=checkbox]。
    expect(
      container.querySelectorAll('.cd-ai-chat-dialogue-checkbox input[type="checkbox"]').length,
    ).toBe(2);
    // 一条都没选 → 没有任何行带选中高亮。
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper-selected').length).toBe(0);
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });

  it('选中某条后该行带 -wrapper-selected 高亮', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig, selecting: true },
    });
    const first = container.querySelector(
      '.cd-ai-chat-dialogue-checkbox input[type="checkbox"]',
    ) as HTMLInputElement;
    await fireEvent.click(first);
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper-selected').length).toBe(1);
  });

  // Semi 的失败态是在内容左侧放一个 IconAlertCircle（-content-failed），
  // 并给 content 加 -content-error 修饰类；没有任何错误文案节点。
  // 本库原来渲染的是一行 locale 文案 + 自造类名 -content-failed-text，属自造。
  it('error 状态：渲染失败图标 + content 带 -content-error，无自造文案节点', async () => {
    // content-failed 图标跟 status 直接挂钩、与是否有文本内容无关（渲染在
    // content-wrapper 层）；content-error 是气泡修饰类，只会挂在文本块的 wrapCls
    // 上（对齐 Semi dialogueContent.tsx wrapCls + textContent 判断）——消息若无文本
    // 内容（如 content:[]）就没有文本块承载这个类，故这里给消息带上真实文本才能
    // 验证 content-error 生效。
    const errorChats: AIDialogueMessage[] = [
      {
        id: 'e1',
        role: 'assistant',
        content: [{ type: 'message', content: [{ type: 'output_text', text: '请求失败' }] }],
        status: 'failed',
      },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: errorChats, roleConfig },
    });
    const failed = container.querySelector('.cd-ai-chat-dialogue-content-failed');
    expect(failed).not.toBeNull();
    // 图标而非文字。
    expect(failed?.querySelector('svg')).not.toBeNull();
    // 默认 mode=bubble → 满足 Semi 的 -content-error 条件，挂在文本块（非外层容器）。
    expect(container.querySelector('.cd-ai-chat-dialogue-content-error')).not.toBeNull();
    // 自造的文案节点不该再出现。
    expect(container.querySelector('.cd-ai-chat-dialogue-content-failed-text')).toBeNull();
  });

  // 对齐 Semi aiChatDialogue.scss &-content-wrapper { display:flex; align-items:end }：
  // 失败图标须与 -content-inner 同处一个 flex 容器（横向排列、底部对齐），不是各自块级
  // 堆叠。真机对照 Semi 截图确认图标贴气泡左下角；jsdom 不计算真实几何，这里只能断言
  // 两者同处 -content-wrapper 直接子节点，具体对齐关系已用 ego-browser 实测 rect 验证。
  it('失败图标与内容同处 -content-wrapper（flex 布局承载对齐）', () => {
    const errorChats: AIDialogueMessage[] = [
      {
        id: 'e3',
        role: 'assistant',
        content: [{ type: 'message', content: [{ type: 'output_text', text: '请求失败' }] }],
        status: 'failed',
      },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: errorChats, roleConfig },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-content-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector(':scope > .cd-ai-chat-dialogue-content-failed')).not.toBeNull();
    expect(wrapper!.querySelector(':scope > .cd-ai-chat-dialogue-content-inner')).not.toBeNull();
  });

  // cancelled 与 failed 同样出图标（对齐 Semi 的 FAILED || CANCELLED 判定）。
  it('cancelled 状态同样渲染失败图标', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'c1', role: 'assistant', content: [], status: 'cancelled' }],
        roleConfig,
      },
    });
    expect(container.querySelector('.cd-ai-chat-dialogue-content-failed')).not.toBeNull();
  });

  // 对齐 Semi dialogueContent.tsx：-content-failed 图标判断是 FAILED || CANCELLED
  // （390 行），但 -content-error 气泡修饰类只判 FAILED（167 行），两处故意不同——
  // cancelled 状态下应该只出图标，气泡不带 -content-error。本库原来两处共用同一个
  // isError（failed || cancelled）变量，导致 cancelled 也误挂气泡修饰类。
  it('cancelled 状态：有失败图标，但气泡不带 -content-error（对齐 Semi 两处不同判断）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'c2', role: 'assistant', content: '已取消', status: 'cancelled' }],
        roleConfig,
      },
    });
    expect(container.querySelector('.cd-ai-chat-dialogue-content-failed')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-dialogue-content-error')).toBeNull();
  });

  // 对齐 Semi 官方「消息状态」demo 的真实输入形态：failed 消息 content 是纯字符串
  // （不是结构化数组），验证失败图标 + 文本内容能同时正确渲染，不只是逻辑推断
  // normalizeDialogueContent('请求错误') 会被安全包成文本块。MarkdownRender 编译是
  // 异步的（惰性 import 编译器，见 markdown-render/MarkdownRender.a11y.test.ts 顶部
  // 注释），须等一轮 microtask 才能读到真实渲染文本，同文件其它处已有先例（如 473 行）。
  it('failed 状态 + content 为纯字符串（对齐 Semi 官方 demo 用例）：图标与文本均正确渲染', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'e2', role: 'assistant', content: '请求错误', status: 'failed' }],
        roleConfig,
      },
    });
    expect(container.querySelector('.cd-ai-chat-dialogue-content-failed')).not.toBeNull();
    await new Promise((r) => setTimeout(r, 100));
    expect(container.textContent).toContain('请求错误');
  });

  // 对齐 Semi 官方「消息状态」demo：in_progress 消息完全不带 content 字段（不是
  // content:[] 空数组），验证 normalizeDialogueContent(undefined) 安全兜底、
  // loading 态照常渲染，不因缺字段而报错或掉进正常内容分支。
  it('in_progress 状态且 content 字段完全缺失（对齐 Semi 官方 demo 用例）：仍渲染 loading 态', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'l2', role: 'assistant', status: 'in_progress' } as AIDialogueMessage],
        roleConfig,
      },
    });
    const loading = container.querySelector('.cd-ai-chat-dialogue-content-loading');
    expect(loading).not.toBeNull();
    expect(
      loading!.querySelectorAll('.cd-ai-chat-dialogue-content-loading-item').length,
    ).toBe(3);
  });
});

describe('AIChatDialogue · 消息编辑（P1）', () => {
  const editChats: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: [{ type: 'message', content: [{ type: 'input_text', text: '原始消息' }] }],
      status: 'completed',
    },
  ];

  it('user 消息展示编辑按钮，点击触发 onMessageEdit', async () => {
    const onMessageEdit = vi.fn();
    const { container } = renderWithLocale(AIChatDialogueEditFixture, {
      props: { chats: editChats, onMessageEdit },
    });
    const editBtn = container.querySelector('button[aria-label="Edit"]') as HTMLButtonElement;
    expect(editBtn).not.toBeNull();
    await fireEvent.click(editBtn);
    expect(onMessageEdit).toHaveBeenCalledTimes(1);
    expect(onMessageEdit.mock.calls[0]![0].id).toBe('u1');
  });

  it('message.editing=true 时用 messageEditRender 替代内容', async () => {
    const editing: AIDialogueMessage[] = [{ ...editChats[0]!, editing: true }];
    const { container } = renderWithLocale(AIChatDialogueEditFixture, {
      props: { chats: editing },
    });
    const editor = container.querySelector('[data-testid="edit-editor"]');
    expect(editor).not.toBeNull();
    // 载荷含原消息文本（dialogueMessageToInput 抽取）
    expect(editor?.textContent).toContain('原始消息');
    // 操作栏对齐 Semi Dialogue.tsx render() 无条件渲染 actionNode()（不随 editing/isLoading/
    // selecting 门禁掉），编辑按钮依然在 DOM 里（showEdit 只看 role===user，与 editing 无关，
    // 再点一次是切换/退出编辑）。本条测试原断言「编辑态不显示操作按钮」对应本库原来多包的
    // 一层 `!isEditing` 门禁，真机验证到会连带砍掉整个操作栏（hover 编辑中的消息整行出不来
    // 操作区），已随之移除，此处断言相应改为「按钮仍存在」。
    expect(container.querySelector('button[aria-label="Edit"]')).not.toBeNull();
  });

  it('editing 态无 axe 违规', async () => {
    const editing: AIDialogueMessage[] = [{ ...editChats[0]!, editing: true }];
    const { container } = renderWithLocale(AIChatDialogueEditFixture, {
      props: { chats: editing },
    });
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });
});

describe('AIChatDialogue · 工具块完整交互（P1）', () => {
  const toolChats: AIDialogueMessage[] = [
    {
      id: 'a1',
      role: 'assistant',
      content: [
        {
          type: 'function_call',
          name: 'get_weather',
          arguments: '{"city":"SF"}',
          output: '{"temp":20}',
          call_id: 'call_1',
          status: 'completed',
        },
      ],
      status: 'completed',
    },
  ];

  // Semi 的 ToolCallWidget（dialogueContent.tsx:137-143）是一个**扁平 div**：
  // IconWrench + `name  arguments` 两段文本，没有折叠、没有状态图标、没有分节。
  // 本库原来自造了一整套结构化面板（header/body/section/args/status/server/id 等
  // 10 个 Semi 不存在的类名），这批用例也是照那套写的，已随实现一起收敛。
  it('工具块是扁平结构：一个 -content-tool-call + 扳手图标 + 名称与参数文本', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: toolChats, roleConfig },
    });
    const box = container.querySelector('.cd-ai-chat-dialogue-content-tool-call');
    expect(box).not.toBeNull();
    // Semi 用 IconWrench。
    expect(box!.querySelector('svg')).not.toBeNull();
    expect(box!.textContent).toContain('get_weather');
    expect(box!.textContent).toContain('"city"');
    // 自造的那套子结构不该再出现。
    for (const sub of ['header', 'body', 'section', 'args', 'status', 'server', 'id']) {
      expect(
        container.querySelector(`.cd-ai-chat-dialogue-content-tool-call-${sub}`),
        `-tool-call-${sub} 是本库自造，Semi 没有`,
      ).toBeNull();
    }
  });

  it('工具块无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: toolChats, roleConfig },
    });
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });
});

// steps 内容块（对齐 Semi MESSAGE_ITEM_TYPE.STEPS + widgets/contentItem/dialogueStep.tsx）。
// 本库此前完全没有这个内容类型：ContentItemRenderer 无分支、core 无类型，
// 传 steps 进来只会落到「未知类型」兜底分支渲染一个类型标签。
describe('AIChatDialogue · steps 内容块', () => {
  const stepChats: AIDialogueMessage[] = [
    {
      id: 's1',
      role: 'assistant',
      content: [
        {
          type: 'steps',
          steps: [
            {
              status: 'completed',
              summary: '检索资料',
              actions: [{ summary: '搜索', description: '关键词 A' }],
            },
            { status: 'in_progress', summary: '整理结论' },
          ],
        },
      ],
    },
  ];

  it('渲染每个步骤：summary + 完成/加载前缀', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: stepChats, roleConfig },
    });
    const steps = container.querySelectorAll('.cd-ai-chat-dialogue-step');
    expect(steps).toHaveLength(2);
    expect(steps[0]!.textContent).toContain('检索资料');
    expect(steps[1]!.textContent).toContain('整理结论');

    // completed 用 IconStoryStroked；未完成用三点 loading（复用 -content-loading 类树）。
    expect(steps[0]!.querySelector('.cd-ai-chat-dialogue-step-completed')).not.toBeNull();
    expect(steps[1]!.querySelectorAll('.cd-ai-chat-dialogue-content-loading-item')).toHaveLength(3);
  });

  // 对齐 Semi：`actionsLength > 0` 才渲染展开箭头。
  it('只有带 actions 的步骤渲染展开箭头', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: stepChats, roleConfig },
    });
    const steps = container.querySelectorAll('.cd-ai-chat-dialogue-step');
    expect(steps[0]!.querySelector('.cd-ai-chat-dialogue-step-suffix')).not.toBeNull();
    expect(steps[1]!.querySelector('.cd-ai-chat-dialogue-step-suffix')).toBeNull();
  });

  it('渲染 action 的 summary 与 description', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: stepChats, roleConfig },
    });
    expect(
      container.querySelector('.cd-ai-chat-dialogue-step-action-summary')?.textContent,
    ).toBe('搜索');
    expect(
      container.querySelector('.cd-ai-chat-dialogue-step-action-desc')?.textContent?.trim(),
    ).toBe('关键词 A');
  });

  // 对齐 Semi：初始 openIndexes = 所有下标，即默认全展开。
  it('默认全部展开，点击可折叠', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: stepChats, roleConfig },
    });
    const first = container.querySelector('.cd-ai-chat-dialogue-step') as HTMLButtonElement;
    expect(first.getAttribute('aria-expanded')).toBe('true');
    await fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('steps 块无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: stepChats, roleConfig },
    });
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });
});

// 对话内代码块（对齐 Semi widgets/contentItem/code.tsx，挂 code 键，内部复用 markdown-render 的 code.svelte）。
describe('AIChatDialogue · 代码块（DialogueCode）', () => {
  const codeChats: AIDialogueMessage[] = [
    {
      id: 'c1',
      role: 'assistant',
      content: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: '```ts\nconst a = 1;\n```' }],
        },
      ],
    },
  ];

  it('围栏代码块渲染 topSlot：语言标签 + 复制按钮', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: codeChats, roleConfig },
    });
    // CodeHighlight 内部动态 import prism，需等一拍它挂载完成。
    await new Promise((r) => setTimeout(r, 100));
    const block = container.querySelector('.cd-ai-chat-dialogue-code');
    expect(block, '应套上对话专属代码块外壳').not.toBeNull();
    expect(
      block!.querySelector('.cd-ai-chat-dialogue-code-topSlot-type')?.textContent,
    ).toBe('ts');
    expect(block!.querySelector('.cd-ai-chat-dialogue-code-topSlot-copy-wrapper')).not.toBeNull();
  });

  // 真机验证到：DialogueCode.svelte 的 `</div>\n<Code/>` 换行会被 Svelte 编译成一个
  // 空白文本节点，插在 topSlot 与代码内容之间；外壳 line-height:32px（对齐 Semi token）
  // 施加在这个孤立空白文本节点上会被撑成一整行可见空白（Semi JSX 渲染无此节点，不会复现）。
  // 外壳改 display:flex 后子节点按 flex item 处理即可消除，这里钉住不回归。
  it('topSlot 与代码内容之间无空白撑高（真机验证 gap 从 32px 消除到 0）', async () => {
    // jsdom 不渲染 scoped <style>，display:flex 的视觉效果已真机验证（gap 从 32px→0），
    // 这里只钉 DOM 结构：topSlot 后紧跟的下一个 element 直接是 CodeHighlight 容器，
    // 中间不能有游离的可见占位元素（曾经的空白文本节点是文本而非元素，此断言测不到它，
    // 但能防止未来有人在中间插入别的块级占位元素）。
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: codeChats, roleConfig },
    });
    await new Promise((r) => setTimeout(r, 100));
    const block = container.querySelector('.cd-ai-chat-dialogue-code') as HTMLElement;
    const topSlot = block.querySelector('.cd-ai-chat-dialogue-code-topSlot')!;
    expect(topSlot.nextElementSibling?.classList.contains('cd-code-highlight')).toBe(true);
    expect(block.childElementCount).toBe(2);
  });

  // 对齐 Semi：`language ? 套壳 : code(props)` —— 无语言不套 topSlot。
  it('无语言的代码块不套 topSlot 外壳', async () => {
    const noLang: AIDialogueMessage[] = [
      {
        id: 'c2',
        role: 'assistant',
        content: [{ type: 'message', content: [{ type: 'output_text', text: '```\nplain\n```' }] }],
      },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: noLang, roleConfig },
    });
    await new Promise((r) => setTimeout(r, 100));
    expect(container.querySelector('.cd-ai-chat-dialogue-code')).toBeNull();
  });

  it('代码块无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: codeChats, roleConfig },
    });
    await new Promise((r) => setTimeout(r, 100));
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });
});

// 操作区（对齐 Semi widgets/dialogueAction.tsx）。
// 本库原来是一排裸 emoji 按钮（👍👎🗑✎↻⇪），且删除直接触发回调、复制不写剪贴板不弹 Toast。
describe('AIChatDialogue · 操作区（DialogueAction）', () => {
  const assistantDone: AIDialogueMessage[] = [
    { id: 'a1', role: 'assistant', content: 'hi', status: 'completed' },
  ];

  it('操作按钮用具名图标 Button，不再是裸 emoji', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig },
    });
    const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
    expect(action).not.toBeNull();
    // 每个操作按钮都挂 Semi 的 -action-btn 类。
    expect(action.querySelectorAll('.cd-ai-chat-dialogue-action-btn').length).toBeGreaterThan(0);
    // 不应再出现 emoji 文本。
    expect(action.textContent).not.toContain('👍');
    expect(action.textContent).not.toContain('🗑');
  });

  // 对齐 Semi render()：showFeedback = 非 user 且 status==='completed'。
  it('assistant 且 completed 才显示点赞/点踩', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig },
    });
    expect(container.querySelector('button[aria-label="Good response"]')).not.toBeNull();

    const userMsg: AIDialogueMessage[] = [{ id: 'u1', role: 'user', content: 'hi', status: 'completed' }];
    const r2 = renderWithLocale(AIChatDialogue, { props: { chats: userMsg, roleConfig } });
    expect(r2.container.querySelector('button[aria-label="Good response"]')).toBeNull();
  });

  // 对齐 Semi render()：{completed && this.shareNode()}——分享按钮只看 completed，
  // 与 onMessageShare 是否传入无关。真机比对 Semi 截图发现本库原来判断反了
  // （误判成「传了回调才显示」），System/User/Assistant 三种角色的按钮数都因此少了一个。
  it('分享按钮：completed 即恒渲染，不依赖 onMessageShare 是否传入', () => {
    // 不传 onMessageShare，completed 消息仍应有分享按钮。
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats: assistantDone, roleConfig } });
    expect(container.querySelector('button[aria-label="Share"]')).not.toBeNull();

    const inProgress: AIDialogueMessage[] = [
      { id: 'a2', role: 'assistant', content: 'hi', status: 'in_progress' },
    ];
    const r2 = renderWithLocale(AIChatDialogue, { props: { chats: inProgress, roleConfig } });
    expect(r2.container.querySelector('button[aria-label="Share"]')).toBeNull();
  });

  // 渲染顺序对齐 Semi render()：copy → reset → share → edit → like/dislike → more。
  it('操作栏按钮顺序对齐 Semi：assistant 为 复制/重新生成/分享/点赞/点踩/更多', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig, showReset: true },
    });
    const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
    const labels = [...action.querySelectorAll('.cd-ai-chat-dialogue-action-btn')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Copy', 'Regenerate', 'Share', 'Good response', 'Bad response', 'More actions']);
  });

  // 对齐 Semi render() {completed && this.copyNode()}：copy 只在 completed 时显示，
  // 不是无条件渲染——真机对照 Semi 截图，failed 状态下操作区只有「重新生成 + 更多」，
  // 没有复制按钮；本库原来漏了这层门禁，failed/in_progress 都会误显示复制按钮。
  it('failed 状态：操作区无复制按钮，只有 重新生成 + 更多', () => {
    const failedChats: AIDialogueMessage[] = [
      { id: 'f1', role: 'assistant', content: '请求错误', status: 'failed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: failedChats, roleConfig, showReset: true },
    });
    const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
    const labels = [...action.querySelectorAll('.cd-ai-chat-dialogue-action-btn')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Regenerate', 'More actions']);
  });

  it('操作栏按钮顺序对齐 Semi：user 为 复制/分享/编辑/更多', () => {
    const userMsg: AIDialogueMessage[] = [{ id: 'u1', role: 'user', content: 'hi', status: 'completed' }];
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats: userMsg, roleConfig } });
    const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
    const labels = [...action.querySelectorAll('.cd-ai-chat-dialogue-action-btn')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['Copy', 'Share', 'Edit', 'More actions']);
  });

  // 对齐 Semi：删除收在「更多」下拉里，不再是操作栏上的直接按钮。
  it('删除不在操作栏直出，收在「更多」下拉里', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig },
    });
    const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
    expect(action.querySelector('button[aria-label="Delete"]')).toBeNull();
    expect(action.querySelector('button[aria-label="More actions"]')).not.toBeNull();
  });

  it('操作区无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig },
    });
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });

  // 对齐 Semi render() finished = status !== IN_PROGRESS && status !== INCOMPLETE：
  // queued 不在排除列表里，跟 in_progress/incomplete 不是同一套行为——真机对照 Semi
  // 官方 demo 实测确认，queued 状态操作区容器本身可见（不挂 -action-hidden），只是
  // completed=false 挡掉复制/分享/点赞点踩，非最后一条时 showReset 也是 false，最终
  // 只剩「更多」一个按钮；而 in_progress/incomplete 是整个操作区容器都隐藏，连
  // 「更多」都看不到。三态常被当作「loading 态」一并处理，但在操作区层面 queued 是
  // 特例，不能跟另外两个混为一谈。
  it('queued 状态：操作区容器可见（不隐藏），非最后一条时只剩「更多」按钮', () => {
    const queuedChats: AIDialogueMessage[] = [
      { id: 'q1', role: 'assistant', content: 'first' },
      { id: 'q2', role: 'assistant', content: [], status: 'queued' },
      { id: 'q3', role: 'user', content: 'placeholder' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: queuedChats, roleConfig },
    });
    const wrappers = container.querySelectorAll('.cd-ai-chat-dialogue-wrapper');
    const action = wrappers[1]!.querySelector('.cd-ai-chat-dialogue-action')!;
    expect(action.classList.contains('cd-ai-chat-dialogue-action-hidden')).toBe(false);
    const labels = [...action.querySelectorAll('.cd-ai-chat-dialogue-action-btn')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(labels).toEqual(['More actions']);
  });

  it('in_progress / incomplete 状态：操作区容器整体隐藏（对齐 finished 判定）', () => {
    for (const status of ['in_progress', 'incomplete'] as const) {
      const { container } = renderWithLocale(AIChatDialogue, {
        props: {
          chats: [{ id: `p-${status}`, role: 'assistant', content: [], status }],
          roleConfig,
        },
      });
      const action = container.querySelector('.cd-ai-chat-dialogue-action')!;
      expect(
        action.classList.contains('cd-ai-chat-dialogue-action-hidden'),
        `status=${status} 应挂 -action-hidden`,
      ).toBe(true);
    }
  });

  // 对齐 Semi interface.ts:119-131：DefaultActionNodeObj 真实只有 copy/like/dislike/
  // reset/moreNode 五个字段（shareNode/editNode 是 dialogueAction.tsx 内部私有方法，
  // 从未被塞进这个对象），RenderActionProps.defaultActions 是数组（dialogueAction.tsx:
  // 270-292 actionNodes，completed→copy，showFeedback→like+dislike，showReset→reset，
  // moreNode 无条件包含）。本库原来 defaultActionsObj 多给了 shareNode/editNode 两个
  // 自造字段，且完全没有 defaultActions 数组，用户 demo 用到的
  // `props.defaultActions[0]` 场景无法实现。
  it('renderDialogueAction：defaultActionsObj 不含 shareNode/editNode，defaultActions 数组顺序对齐 Semi actionNodes', () => {
    let capturedKeys: string[] = [];
    let capturedActionsLength = -1;
    const { container } = renderWithLocale(AIChatDialogueRenderActionFixture, {
      props: {
        chats: assistantDone,
        roleConfig,
        onCapture: (keys: string[], actionsLength: number) => {
          capturedKeys = keys;
          capturedActionsLength = actionsLength;
        },
      },
    });
    expect(container.querySelector('.cd-ai-chat-dialogue-action')).not.toBeNull();
    expect(capturedKeys).not.toContain('shareNode');
    expect(capturedKeys).not.toContain('editNode');
    // assistantDone 只有一条消息，天然是列表里的最后一条：completed 且非 user →
    // showFeedback=true；role='assistant' 且 isLastChat=true → showReset=true。
    // → copy + like + dislike + reset + more，共 5 个。
    expect(capturedKeys.sort()).toEqual(
      ['copyNode', 'dislikeNode', 'likeNode', 'moreNode', 'resetNode'].sort(),
    );
    expect(capturedActionsLength).toBe(5);
  });
});

// 文件卡（对齐 Semi dialogueContent.tsx 的 FileAttachment）。
// 本库原来只有一个裸 button + 文件名一行，缺 <a> 跳转、类型底色图标框、「类型 大小」第二行、引用入口。
describe('AIChatDialogue · 文件卡（DialogueFile）', () => {
  function fileChats(file: Record<string, unknown>, role = 'assistant'): AIDialogueMessage[] {
    return [{ id: 'f1', role, content: [{ type: 'message', content: [{ type: 'input_file', ...file }] }] }];
  }

  it('渲染为可跳转的 <a>，含图标框 + 标题 + 「类型 大小」两行', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: fileChats({ filename: '报告.pdf', file_url: 'https://x/a.pdf', size: '12KB' }), roleConfig },
    });
    const card = container.querySelector('a.cd-ai-chat-dialogue-content-file') as HTMLAnchorElement;
    expect(card, '应是 <a> 而非 button').not.toBeNull();
    expect(card.getAttribute('href')).toBe('https://x/a.pdf');
    expect(card.getAttribute('target')).toBe('_blank');
    expect(card.querySelector('.cd-ai-chat-dialogue-content-file-title')?.textContent).toBe('报告.pdf');
    expect(card.querySelector('.cd-ai-chat-dialogue-content-file-type')?.textContent).toBe('pdf');
    expect(card.querySelector('.cd-ai-chat-dialogue-content-file-metadata')?.textContent).toContain('12KB');
  });

  // 图标分类顺序照搬 Semi renderFileIcon 的 if-else。
  it('按后缀挂类型底色类', () => {
    const cases: [string, string][] = [
      ['a.docx', 'word'],
      ['a.pdf', 'pdf'],
      ['a.xlsx', 'excel'],
      ['a.ts', 'code'],
      ['a.mp4', 'video'],
      ['a.png', 'image'],
      ['a.zip', 'default'],
    ];
    for (const [filename, cls] of cases) {
      const { container } = renderWithLocale(AIChatDialogue, {
        props: { chats: fileChats({ filename }), roleConfig },
      });
      expect(
        container.querySelector(`.cd-ai-chat-dialogue-content-file-icon-${cls}`),
        `${filename} 应挂 -file-icon-${cls}`,
      ).not.toBeNull();
    }
  });

  // 对齐 Semi：引用入口只在 user 消息 + showReference 时出现。
  it('引用入口仅 user 消息且 showReference 时渲染', () => {
    const withRef = renderWithLocale(AIChatDialogue, {
      props: { chats: fileChats({ filename: 'a.pdf' }, 'user'), roleConfig, showReference: true },
    });
    expect(withRef.container.querySelector('.cd-ai-chat-dialogue-content-icon-reference')).not.toBeNull();

    const assistant = renderWithLocale(AIChatDialogue, {
      props: { chats: fileChats({ filename: 'a.pdf' }), roleConfig, showReference: true },
    });
    expect(assistant.container.querySelector('.cd-ai-chat-dialogue-content-icon-reference')).toBeNull();
  });

  it('文件卡无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: fileChats({ filename: 'a.pdf', file_url: 'https://x/a.pdf' }), roleConfig },
    });
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });
});

// hints 提示区。此前本库直接复用 chat/Hint.svelte，类名前缀是 cd-chat-hint-*，
// 且没有 selecting 态——Semi 是两个独立组件（chat/hint.tsx 与 dialogueHint.tsx），
// 前缀与能力都不同。这里钉住 dialogue 版的类名与行为。
describe('AIChatDialogue · hints 提示区（对齐 Semi dialogueHint）', () => {
  const hints = ['帮我总结这段', '换个说法'];

  it('渲染 dialogue 自己的类名前缀（不是 chat 的），每条一个 item', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints },
    });
    expect(container.querySelector('.cd-ai-chat-dialogue-hints')).not.toBeNull();
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-hint-item').length).toBe(2);
    expect(container.querySelector('.cd-ai-chat-dialogue-hint-content')?.textContent).toBe(
      '帮我总结这段',
    );
    // 复用 chat/Hint 时会渲染成这些类名 + 一个箭头图标，dialogue 版都不该有。
    expect(container.querySelector('.cd-chat-hints')).toBeNull();
    expect(container.querySelector('.cd-chat-hint-item')).toBeNull();
    expect(container.querySelector('.cd-chat-hint-icon')).toBeNull();
  });

  it('selecting 态给容器加 -hints-selecting（左外边距让位多选框）', () => {
    const off = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints },
    });
    expect(
      off.container.querySelector('.cd-ai-chat-dialogue-hints-selecting'),
    ).toBeNull();

    const on = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints, selecting: true },
    });
    expect(
      on.container.querySelector('.cd-ai-chat-dialogue-hints-selecting'),
    ).not.toBeNull();
  });

  it('点击提示项触发 onHintClick(hint)，且无 axe 违规', async () => {
    const onHintClick = vi.fn();
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints, onHintClick },
    });
    await fireEvent.click(
      container.querySelectorAll('.cd-ai-chat-dialogue-hint-item')[1] as HTMLElement,
    );
    expect(onHintClick).toHaveBeenCalledWith('换个说法');
    await expectNoAxeViolations(container, AXE_OPTIONS);
  });

  // 对齐 Semi index.tsx:355-364：Hint 跟每条 DialogueItem 同级，是 -list 滚动容器内部
  // 的最后一项，随消息内容一起滚动。本库原来把它挂在 -list 容器外部（跟 -list 平级挂在
  // 根容器下），真机对照 Semi 截图，提示区被挤到滚动区域之外、明显偏下，不贴着最后一条
  // 消息卡片。
  it('提示区在 -list 滚动容器内部（对齐 Semi 结构，随消息一起滚动）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints },
    });
    const list = container.querySelector('.cd-ai-chat-dialogue-list');
    expect(list).not.toBeNull();
    expect(list!.querySelector('.cd-ai-chat-dialogue-hints')).not.toBeNull();
  });
});

// DOM 分层与右对齐。Semi Dialogue.tsx 的结构是
//   wrapper[-selected][-continue-send] > checkbox + container[-right] > avatar + inner
// 本库原来整个缺 container 层，且右对齐用的是反向标记 -wrapper-leftAlign
// （默认就反转、传 leftAlign 再转回来），与 Semi 的 -container-right 语义相反。
describe('AIChatDialogue · DOM 分层 / 右对齐（对齐 Semi Dialogue.tsx）', () => {
  it('每条消息都有 container 层，且包住 avatar 与 inner', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig },
    });
    const containers = container.querySelectorAll('.cd-ai-chat-dialogue-container');
    expect(containers.length).toBe(chats.length);
    const first = containers[0]!;
    expect(first.querySelector('.cd-ai-chat-dialogue-avatar')).not.toBeNull();
    expect(first.querySelector('.cd-ai-chat-dialogue-inner')).not.toBeNull();
    // container 必须是 wrapper 的子节点（层级不能塌）。
    expect(first.parentElement?.classList.contains('cd-ai-chat-dialogue-wrapper')).toBe(true);
  });

  it('align=leftRight（默认）时只有 user 那条带 -container-right', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig },
    });
    const rights = container.querySelectorAll('.cd-ai-chat-dialogue-container-right');
    const userCount = chats.filter((c) => c.role === 'user').length;
    expect(rights.length).toBe(userCount);
    // 反向标记已废弃，不该再出现。
    expect(container.querySelector('.cd-ai-chat-dialogue-wrapper-leftAlign')).toBeNull();
  });

  it('align=leftAlign 时一条都不右对齐', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats, roleConfig, align: 'leftAlign' },
    });
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-container-right').length).toBe(0);
  });
});

// continueSend：Semi index.tsx:331 计算了 `index>0 && 同角色`，但第349行实际传给
// DialogueItem 的硬编码是 continueSend={false}（附 todo「暂时设置成 false，如果用户
// 有相关需求，转为一个对外提供的 API」）——第331行是尚未启用的死代码，当前真实行为是
// 头像/标题永远不因连续同角色隐藏。真机对照 Semi 官方截图：连续三条 Assistant 消息
// （请求成功/请求中/请求错误），每条都带完整头像。本库原来接了第331行那行计算并让它
// 生效，是超出 Semi 当前实现的自造行为，已改为恒传 false。
describe('AIChatDialogue · continueSend 恒为 false（对齐 Semi index.tsx:349 当前实现）', () => {
  const sameRole: AIDialogueMessage[] = [
    { id: 'a1', role: 'assistant', content: '第一句' },
    { id: 'a2', role: 'assistant', content: '第二句' },
    { id: 'u1', role: 'user', content: '我的话' },
  ];

  it('同角色连续发言：每条头像与标题都照常渲染，不隐藏', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: sameRole, roleConfig },
    });
    const wrappers = container.querySelectorAll('.cd-ai-chat-dialogue-wrapper');
    for (const wrapper of wrappers) {
      expect(wrapper.querySelector('.cd-ai-chat-dialogue-avatar-hidden')).toBeNull();
      expect(wrapper.querySelector('.cd-ai-chat-dialogue-title')).not.toBeNull();
      expect(
        wrapper.classList.contains('cd-ai-chat-dialogue-wrapper-continue-send'),
      ).toBe(false);
    }
  });
});

// 对齐 Semi dialogueTitle.tsx:14 `<span>{role?.name}</span>` 无条件渲染：role?.name
// 为空时 span 元素仍在（只是内容为空文本），不是整个元素消失。本库原来用
// `{#if role?.name}` 包裹整个 span，导致没有角色名时这个元素完全不出现在 DOM 里。
describe('AIChatDialogue · 标题无条件渲染（对齐 Semi dialogueTitle.tsx）', () => {
  it('roleConfig 未配置对应角色名时，.cd-ai-chat-dialogue-title 元素仍渲染（内容为空）', () => {
    const noNameChats: AIDialogueMessage[] = [{ id: 'a1', role: 'assistant', content: 'hi' }];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: noNameChats, roleConfig: {} },
    });
    const title = container.querySelector('.cd-ai-chat-dialogue-title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('');
  });
});

// 内容分层与 mode 修饰类。Semi dialogueContent.tsx 把 -user/-bubble/-no-bubble/-error
// 挂在 content 元素上并由 mode 驱动；本库原来挂在最外层 wrapper 上，层级与命名都不同。
// 内容本体还有 -content-wrapper > -content-failed + -content-inner 两层，本库整个缺。
describe('AIChatDialogue · 内容分层 / mode 修饰类（对齐 Semi dialogueContent.tsx）', () => {
  const one: AIDialogueMessage[] = [{ id: 'a1', role: 'assistant', content: 'hi' }];

  it('content 内是 -content-wrapper > -content-inner 两层', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: one, roleConfig },
    });
    const content = container.querySelector('.cd-ai-chat-dialogue-content')!;
    const wrapper = content.querySelector('.cd-ai-chat-dialogue-content-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('.cd-ai-chat-dialogue-content-inner')).not.toBeNull();
  });

  // 对齐 Semi dialogueContent.tsx（真机验证到 semi.design 官网 DOM）：气泡修饰类
  // （-bubble/-userBubble/-no-bubble/-user/-error）挂在每个文本块自己身上（wrapCls），
  // 不是外层 PREFIX_CONTENT 容器——外层容器只有基础类 + editing 类。字符串 content
  // 归一化成单个 output_text 块后，DOM 里会有两层 .cd-ai-chat-dialogue-content：
  // 外层（无气泡类）+ 内层文本块（带气泡类），用 querySelectorAll 取最后一个（文本块）。
  function textBlockContent(container: HTMLElement): Element {
    const all = container.querySelectorAll('.cd-ai-chat-dialogue-content');
    return all[all.length - 1]!;
  }

  it('mode=bubble：文本块带 -content-bubble，不带 -no-bubble', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: one, roleConfig, mode: 'bubble' },
    });
    const content = textBlockContent(container);
    expect(content.classList.contains('cd-ai-chat-dialogue-content-bubble')).toBe(true);
    expect(content.classList.contains('cd-ai-chat-dialogue-content-no-bubble')).toBe(false);
  });

  it('mode=noBubble：文本块带 -content-no-bubble', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: one, roleConfig, mode: 'noBubble' },
    });
    const content = textBlockContent(container);
    expect(content.classList.contains('cd-ai-chat-dialogue-content-no-bubble')).toBe(true);
    expect(content.classList.contains('cd-ai-chat-dialogue-content-bubble')).toBe(false);
  });

  // mode=userBubble 只让 user 那条起泡，assistant 那条走 no-bubble。
  it('mode=userBubble：user 带 -content-userBubble，assistant 带 -no-bubble', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [
          { id: 'u1', role: 'user', content: 'hi' },
          { id: 'a1', role: 'assistant', content: 'yo' },
        ],
        roleConfig,
        mode: 'userBubble',
      },
    });
    // 每条消息各自渲染「外层容器 + 文本块」两层 .cd-ai-chat-dialogue-content，
    // 文本块是每条消息里的第二个（index 1 和 3）。
    const contents = container.querySelectorAll('.cd-ai-chat-dialogue-content');
    expect(contents[1]!.classList.contains('cd-ai-chat-dialogue-content-userBubble')).toBe(true);
    expect(contents[3]!.classList.contains('cd-ai-chat-dialogue-content-no-bubble')).toBe(true);
  });

  it('user 消息的文本块带 -content-user（修饰类挂在文本块，不是 wrapper 也不是外层容器）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: [{ id: 'u1', role: 'user', content: 'hi' }], roleConfig },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-wrapper')!;
    const contents = container.querySelectorAll('.cd-ai-chat-dialogue-content');
    const outer = contents[0]!;
    const textBlock = textBlockContent(container);
    expect(textBlock.classList.contains('cd-ai-chat-dialogue-content-user')).toBe(true);
    // 外层容器和 wrapper 都不该带这个类。
    expect(outer.classList.contains('cd-ai-chat-dialogue-content-user')).toBe(false);
    expect(wrapper.classList.contains('cd-ai-chat-dialogue-content-user')).toBe(false);
  });

  // Semi 的 loading 是三个弹跳圆点 + 文案，本库原来只有一行裸文字。
  it('loading 态：三个圆点 + 文案（走 locale 非 key）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'l1', role: 'assistant', content: [], status: 'in_progress' }],
        roleConfig,
      },
    });
    const loading = container.querySelector('.cd-ai-chat-dialogue-content-loading')!;
    expect(loading).not.toBeNull();
    expect(
      loading.querySelectorAll('.cd-ai-chat-dialogue-content-loading-item').length,
    ).toBe(3);
    const text = loading.querySelector('.cd-ai-chat-dialogue-content-loading-text');
    expect(text?.textContent?.trim()).toBeTruthy();
    expect(text?.textContent?.trim()).not.toBe('AIChatDialogue.loading');
  });

  // 对齐 Semi dialogueContent.tsx:320 isLoading 判定的完整三态（queued/in_progress/
  // incomplete）：本库原来 isLoading 漏了 incomplete，导致该状态消息既不算 loading 也不算
  // error（isError 只判 failed/cancelled），会掉进正常内容分支渲染空的 MarkdownRender。
  it.each(['queued', 'incomplete'] as const)('loading 态覆盖 status=%s', (status) => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [{ id: 'l1', role: 'assistant', content: [], status }],
        roleConfig,
      },
    });
    const loading = container.querySelector('.cd-ai-chat-dialogue-content-loading');
    expect(loading, `status=${status} 应渲染 loading 态`).not.toBeNull();
    expect(
      loading!.querySelectorAll('.cd-ai-chat-dialogue-content-loading-item').length,
    ).toBe(3);
  });

  // 自定义渲染必须保留 Semi 的包裹层，否则右对齐规则匹配不到。
  it('renderDialogueContentItem 自定义渲染保留 -content-custom-renderer 包裹层', () => {
    const { container } = renderWithLocale(AIChatDialogueCustomRendererFixture, {
      props: { chats: one },
    });
    const custom = container.querySelector('.cd-ai-chat-dialogue-content-custom-renderer');
    expect(custom).not.toBeNull();
    expect(custom!.querySelector('[data-testid="custom-block"]')).not.toBeNull();
  });

  // 对齐 Semi dialogueContent.tsx:236 `customRenderer(i?.type, index, i)`：renderMessage
  // 内部每个子块（input_text/output_text 等）也各自调用一次 customRenderer，
  // renderDialogueContentItem 同时能覆盖外层 ContentItem 类型（如 'message'）和内部
  // 子块类型（如 'input_text'），是两次独立的匹配机会。本库原来只有外层匹配，传
  // { input_text: ... } 完全不生效。
  it('renderDialogueContentItem 能覆盖 message 内部子块类型（如 input_text）', () => {
    const chats: AIDialogueMessage[] = [
      {
        id: 'u1',
        role: 'user',
        content: [
          { type: 'message', content: [{ type: 'input_text', text: '被覆盖的文本' }] },
        ],
      },
    ];
    const { container } = renderWithLocale(AIChatDialogueInnerRendererFixture, {
      props: { chats, mode: 'inner' },
    });
    const custom = container.querySelector('.cd-ai-chat-dialogue-content-custom-renderer');
    expect(custom).not.toBeNull();
    expect(custom!.querySelector('[data-testid="inner-block"]')?.textContent).toBe(
      '被覆盖的文本',
    );
  });

  // 对齐 Semi dialogueContent.tsx:195/236：所有渲染器（外层与内层）真实签名都是
  // (item, message) 两参数，第二个参数是该块所属的完整消息，常见用法是按
  // message.role 分支渲染。本库原来 ContentItemRenderer/DefaultContentRenderer
  // 都只有单参数，读不到 message。
  it('renderDialogueContentItem 渲染器第二参数是完整 message（可按 role 分支）', () => {
    const chats: AIDialogueMessage[] = [
      {
        id: 'u2',
        role: 'user',
        content: [
          { type: 'message', content: [{ type: 'input_text', text: 'hi' }] },
        ],
      },
    ];
    const { container } = renderWithLocale(AIChatDialogueInnerRendererFixture, {
      props: { chats, mode: 'role' },
    });
    expect(container.querySelector('[data-testid="role-user"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="role-assistant"]')).toBeNull();
  });

  // 对齐 Semi DialogueContentItemRendererMap：Record<string, Renderer | Record<string,
  // Renderer>>——工具调用类型（function_call/custom_tool_call/mcp_call）支持二级映射，
  // 按 item.name 精确匹配；未命中函数名不覆盖，走内置渲染。
  describe('renderDialogueContentItem 二级映射（工具调用按 name 细分）', () => {
    it('function_call 按 name 精确匹配到对应子渲染器', () => {
      const toolChats: AIDialogueMessage[] = [
        {
          id: 'a1',
          role: 'assistant',
          status: 'completed',
          content: [{ type: 'function_call', name: 'get_weather', arguments: '{}' }],
        },
      ];
      const { container } = renderWithLocale(AIChatDialogueNestedRendererFixture, {
        props: { chats: toolChats },
      });
      expect(container.querySelector('[data-testid="weather-tool"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="search-tool"]')).toBeNull();
    });

    it('function_call name 未在二级映射里命中：不覆盖，走内置渲染（非自定义块）', () => {
      const toolChats: AIDialogueMessage[] = [
        {
          id: 'a1',
          role: 'assistant',
          status: 'completed',
          content: [{ type: 'function_call', name: 'unmapped_tool', arguments: '{}' }],
        },
      ];
      const { container } = renderWithLocale(AIChatDialogueNestedRendererFixture, {
        props: { chats: toolChats },
      });
      expect(container.querySelector('[data-testid="weather-tool"]')).toBeNull();
      expect(container.querySelector('[data-testid="search-tool"]')).toBeNull();
      expect(container.querySelector('.cd-ai-chat-dialogue-content-custom-renderer')).toBeNull();
    });
  });

  // 对齐 Semi dialogueContent.tsx:340-360：content 是字符串或非字符串但 output_text 有值时，
  // default 渲染器整条接管，不再逐块渲染（即便 content 已是完整多块结构）。
  describe('renderDialogueContentItem default 键（对齐 Semi textContent 判断）', () => {
    it('content 为字符串：default 渲染器接管', () => {
      const strChats: AIDialogueMessage[] = [
        { id: 'a1', role: 'assistant', status: 'completed', content: '纯字符串内容' },
      ];
      const { container } = renderWithLocale(AIChatDialogueNestedRendererFixture, {
        props: { chats: strChats },
      });
      const block = container.querySelector('[data-testid="default-block"]');
      expect(block).not.toBeNull();
      expect(block!.textContent).toContain('纯字符串内容');
    });

    it('content 为完整多块数组但 output_text 有值：default 渲染器仍整条接管', () => {
      const mixedChats: AIDialogueMessage[] = [
        {
          id: 'a1',
          role: 'assistant',
          status: 'completed',
          output_text: '来自 output_text',
          content: [
            { type: 'message', content: [{ type: 'output_text', text: '不应该被渲染' }] },
          ],
        },
      ];
      const { container } = renderWithLocale(AIChatDialogueNestedRendererFixture, {
        props: { chats: mixedChats },
      });
      const block = container.querySelector('[data-testid="default-block"]');
      expect(block).not.toBeNull();
      expect(block!.textContent).toContain('来自 output_text');
      expect(container.textContent).not.toContain('不应该被渲染');
    });

    it('content 为数组且无 output_text：default 不生效，走正常逐块渲染', async () => {
      const normalChats: AIDialogueMessage[] = [
        {
          id: 'a1',
          role: 'assistant',
          status: 'completed',
          content: [{ type: 'message', content: [{ type: 'output_text', text: '正常渲染' }] }],
        },
      ];
      const { container } = renderWithLocale(AIChatDialogueNestedRendererFixture, {
        props: { chats: normalChats },
      });
      expect(container.querySelector('[data-testid="default-block"]')).toBeNull();
      // MarkdownRender 渲染 output_text 是异步的（内核动态 import），等一拍再断言文本。
      await new Promise((r) => setTimeout(r, 100));
      const inner = container.querySelector('.cd-ai-chat-dialogue-content-inner');
      expect(inner).not.toBeNull();
      expect(inner!.textContent).toContain('正常渲染');
    });
  });
});

// 引用区（user 消息 + showReference）。此前一条断言都没有，所以类名用错了复数前缀
// 也没人发现：Semi 的 PREFIX_REFERENCES 只用于容器，子元素一律挂单数 PREFIX_REFERENCE。
describe('AIChatDialogue · 引用区（对齐 Semi contentItem/reference.tsx）', () => {
  const withRefs: AIDialogueMessage[] = [
    {
      id: 'u1',
      role: 'user',
      content: 'hi',
      // 用 .pdf：Semi 只对 word/pdf/excel/code/video 五类出图标，
      // .md 不在其中（原来这里写 spec.md，断言「有图标」其实与 Semi 不符）。
      references: [{ id: 'r1', name: 'spec.pdf' }],
    },
  ];

  it('容器用复数 -references，每项用单数 -reference', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: withRefs, roleConfig, showReference: true },
    });
    const list = container.querySelector('.cd-ai-chat-dialogue-references');
    expect(list).not.toBeNull();
    expect(list!.querySelectorAll('.cd-ai-chat-dialogue-reference').length).toBe(1);
  });

  // 对齐 Semi dialogueContent.tsx:408-414：`<div className={PREFIX_CONTENT}>
  // {references && <ReferenceWidget/>}{node}{loadingNode}</div>`——引用区在
  // PREFIX_CONTENT 容器内部、正文之前，不是容器外部、正文之后。本库原来顺序颠倒
  // （正文在前引用在后）且引用区被挂在容器外——真机对照 Semi 截图，引用条应显示在
  // 消息气泡上方。
  it('引用区在内容容器内部、正文之前（对齐 Semi 渲染顺序）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: withRefs, roleConfig, showReference: true },
    });
    const outerContent = container.querySelector('.cd-ai-chat-dialogue-content')!;
    const refs = outerContent.querySelector('.cd-ai-chat-dialogue-references');
    expect(refs, '引用区应在 -content 容器内部').not.toBeNull();
    // DOM 顺序：引用区节点在文本气泡节点之前。
    const bubble = outerContent.querySelector('.cd-ai-chat-dialogue-content-bubble');
    expect(bubble).not.toBeNull();
    expect(
      refs!.compareDocumentPosition(bubble!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('项内为 -reference-content 包裹层，里面才是 -reference-icon / -reference-name', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: withRefs, roleConfig, showReference: true },
    });
    const item = container.querySelector('.cd-ai-chat-dialogue-reference')!;
    const content = item.querySelector('.cd-ai-chat-dialogue-reference-content');
    expect(content, '-content 应是包裹层').not.toBeNull();
    // icon / name 必须在包裹层**内部**（本库原来是与之并列的分支）。
    expect(content!.querySelector('.cd-ai-chat-dialogue-reference-icon')).not.toBeNull();
    expect(content!.querySelector('.cd-ai-chat-dialogue-reference-name')?.textContent?.trim()).toBe(
      'spec.pdf',
    );
    // 复数前缀的子元素不该再出现。
    expect(container.querySelector('.cd-ai-chat-dialogue-references-icon')).toBeNull();
    expect(container.querySelector('.cd-ai-chat-dialogue-references-name')).toBeNull();
    expect(container.querySelector('.cd-ai-chat-dialogue-references-content')).toBeNull();
  });

  it('无 name 时 -reference-name 回落到 content（对齐 Semi `name || content`）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: [
          { id: 'u2', role: 'user', content: 'hi', references: [{ id: 'r2', content: '一段引用' }] },
        ],
        roleConfig,
        showReference: true,
      },
    });
    expect(
      container.querySelector('.cd-ai-chat-dialogue-reference-name')?.textContent?.trim(),
    ).toBe('一段引用');
  });
});

// 图片修饰类：Semi 的 ImageAttachment 按「同条消息是否多图」加 -img-list，
// 按「是否最后一张 / 下一项是文件」加 -img-last。本库原来只有基础的 -img，
// 而这两个修饰类的 token（128×128 + 右间距）早就按 Semi 建好了、无人消费。
describe('AIChatDialogue · 图片 -img-list / -img-last（对齐 Semi ImageAttachment）', () => {
  const imgMsg = (parts: Record<string, unknown>[]): AIDialogueMessage[] => [
    { id: 'u1', role: 'user', content: [{ type: 'message', content: parts }] },
  ];

  // 对齐 Semi ImageAttachment：用 Image 组件渲染（自带点击放大预览），不是裸 <img>。
  // 本库原来手搓 <img>+<button>，图片完全没有点击预览能力，onclick 只转发外部回调；
  // 真机验证到 semi.design 官网用的是 Semi 通用 Image 组件，onClick 是叠加在内置预览
  // 能力之上的额外回调，不是唯一交互。DOM 层面用 .cd-image 类判断是否真的复用了组件
  // （jsdom 测不出预览浮层的真实弹出效果，那部分已用 ego-browser 真机验证）。
  it('图片用 Image 组件渲染（挂 cd-image 类，非裸 img），onImageClick 仍正常触发', async () => {
    const onImageClick = vi.fn();
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: imgMsg([{ type: 'input_image', image_url: 'a.png' }]),
        roleConfig,
        onImageClick,
      },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-content-img')!;
    expect(wrapper.classList.contains('cd-image')).toBe(true);
    expect(wrapper.querySelector('img')).not.toBeNull();
    await fireEvent.click(wrapper);
    expect(onImageClick).toHaveBeenCalled();
  });

  it('单图：不加 -img-list，但仍是最后一张 → 有 -img-last', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: imgMsg([{ type: 'input_image', image_url: 'a.png' }]), roleConfig },
    });
    const img = container.querySelector('.cd-ai-chat-dialogue-content-img')!;
    expect(img.classList.contains('cd-ai-chat-dialogue-content-img-list')).toBe(false);
    expect(img.classList.contains('cd-ai-chat-dialogue-content-img-last')).toBe(true);
  });

  it('多图：每张都加 -img-list，只有最后一张加 -img-last', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: imgMsg([
          { type: 'input_image', image_url: 'a.png' },
          { type: 'input_image', image_url: 'b.png' },
        ]),
        roleConfig,
      },
    });
    const imgs = [...container.querySelectorAll('.cd-ai-chat-dialogue-content-img')];
    expect(imgs.length).toBe(2);
    expect(imgs.every((n) => n.classList.contains('cd-ai-chat-dialogue-content-img-list'))).toBe(
      true,
    );
    expect(imgs[0]!.classList.contains('cd-ai-chat-dialogue-content-img-last')).toBe(false);
    expect(imgs[1]!.classList.contains('cd-ai-chat-dialogue-content-img-last')).toBe(true);
  });

  // Semi 的判定含「下一项是文件」这一支，不只是「数组末尾」。
  it('图片后紧跟文件：该图也算 -img-last', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: imgMsg([
          { type: 'input_image', image_url: 'a.png' },
          { type: 'input_file', filename: 'x.pdf' },
        ]),
        roleConfig,
      },
    });
    const img = container.querySelector('.cd-ai-chat-dialogue-content-img')!;
    expect(img.classList.contains('cd-ai-chat-dialogue-content-img-last')).toBe(true);
  });
});

// 滚动条按需显隐 + 回到底部按钮结构。
describe('AIChatDialogue · -list-scroll-hidden / -backBottom-button（对齐 Semi index.tsx）', () => {
  it('默认隐藏滚动条（-list-scroll-hidden），用户滚轮后移除', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const list = container.querySelector('.cd-ai-chat-dialogue-list')!;
    expect(list.classList.contains('cd-ai-chat-dialogue-list-scroll-hidden')).toBe(true);
    await fireEvent.wheel(list);
    expect(list.classList.contains('cd-ai-chat-dialogue-list-scroll-hidden')).toBe(false);
  });

  it('回到底部是 span.-backBottom 包 Button.-backBottom-button（非裸 ↓ 字符）', async () => {
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats, roleConfig } });
    const list = container.querySelector('.cd-ai-chat-dialogue-list') as HTMLElement;
    // 造出「距底 > 阈值」的滚动状态：jsdom 下 scrollHeight 恒 0，直接改属性再触发 scroll。
    Object.defineProperty(list, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(list, 'clientHeight', { value: 300, configurable: true });
    list.scrollTop = 0;
    await fireEvent.scroll(list);

    const wrap = container.querySelector('span.cd-ai-chat-dialogue-backBottom');
    expect(wrap, '外层应是 span.-backBottom').not.toBeNull();
    const btn = wrap!.querySelector('button.cd-ai-chat-dialogue-backBottom-button');
    expect(btn, '内层应是带 -backBottom-button 的 Button').not.toBeNull();
    // 图标而非「↓」字符。
    expect(btn!.querySelector('svg')).not.toBeNull();
    expect(btn!.textContent?.trim()).not.toBe('↓');
  });
});

// 引用项的类型图标 / 缩略图分派（对齐 Semi renderReferenceIcon + renderReferenceImage）。
describe('AIChatDialogue · 引用项类型图标（对齐 Semi 的五类映射）', () => {
  const withRef = (ref: Record<string, unknown>): AIDialogueMessage[] => [
    { id: 'u1', role: 'user', content: 'hi', references: [{ id: 'r', ...ref }] },
  ];
  const render1 = (ref: Record<string, unknown>) =>
    renderWithLocale(AIChatDialogue, {
      props: { chats: withRef(ref), roleConfig, showReference: true },
    }).container;

  it('按扩展名给出 -reference-icon-{type} 修饰类', () => {
    for (const [name, type] of [
      ['a.docx', 'word'],
      ['a.pdf', 'pdf'],
      ['a.xlsx', 'excel'],
      ['a.ts', 'code'],
      ['a.mp4', 'video'],
    ] as const) {
      const c = render1({ name });
      expect(
        c.querySelector(`.cd-ai-chat-dialogue-reference-icon-${type}`),
        `${name} 应映射到 ${type}`,
      ).not.toBeNull();
    }
  });

  // Semi 只对这五类出图标：其余扩展名（.md/.zip…）不出图标节点。
  it('五类之外不渲染图标节点', () => {
    const c = render1({ name: 'note.md' });
    expect(c.querySelector('.cd-ai-chat-dialogue-reference-icon')).toBeNull();
    // 名称仍要渲染。
    expect(c.querySelector('.cd-ai-chat-dialogue-reference-name')?.textContent?.trim()).toBe(
      'note.md',
    );
  });

  // 图片类走缩略图而不是图标（对齐 Semi renderReferenceImage）。
  it('图片类且有 url：渲染 -reference-img 缩略图，不渲染图标', () => {
    const c = render1({ name: 'p.png', url: 'https://x/p.png' });
    const img = c.querySelector('.cd-ai-chat-dialogue-reference-img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('https://x/p.png');
    expect(c.querySelector('.cd-ai-chat-dialogue-reference-icon')).toBeNull();
  });

  it('图片类但无 url：不渲染缩略图', () => {
    const c = render1({ name: 'p.png' });
    expect(c.querySelector('.cd-ai-chat-dialogue-reference-img')).toBeNull();
  });
});

// annotationItems（ContentItemRenderer.svelte）用 `a.url_citation ?? a` 同时兼容扁平和嵌套
// 两种输入形态，但 logo 字段必须由数据显式提供（DialogueAnnotation.svelte 用 {#if item.logo}
// 判断是否渲染头像）——真机验证到本库两处 demo 数据都没给 logo，头像组渲染为空白框。
describe('AIChatDialogue · annotations（对齐 Semi dialogueContent.tsx annotationItems）', () => {
  const withAnnotations = (annotations: Record<string, unknown>[]): AIDialogueMessage[] => [
    {
      id: 'a1',
      role: 'assistant',
      status: 'completed',
      content: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: '来源见下方', annotations }],
        },
      ],
    },
  ];

  it('扁平结构：title/logo 直接同级时正确渲染头像', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: withAnnotations([
          { type: 'url_citation', title: 'a', url: 'https://a.com', logo: 'https://a.com/logo.png' },
        ]),
        roleConfig,
      },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-annotation-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('img')).not.toBeNull();
  });

  it('嵌套 url_citation 结构：兼容读取 title/logo', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: withAnnotations([
          { type: 'url_citation', url_citation: { title: 'a', url: 'https://a.com', logo: 'https://a.com/logo.png' } },
        ]),
        roleConfig,
      },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-annotation-wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('img')).not.toBeNull();
  });

  it('未传 logo：不渲染头像（但摘要文案仍正常）', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: withAnnotations([{ type: 'url_citation', title: 'a', url: 'https://a.com' }]),
        roleConfig,
      },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-annotation-wrapper');
    expect(wrapper!.querySelector('img')).toBeNull();
    expect(
      wrapper!.querySelector('.cd-ai-chat-dialogue-annotation-content-description')?.textContent,
    ).toContain('1');
  });

  it('file_citation / container_file_citation 被过滤，不计入摘要数量', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: withAnnotations([
          { type: 'url_citation', title: 'a', url: 'https://a.com' },
          { type: 'file_citation', file_id: 'f-1' },
          { type: 'container_file_citation', file_id: 'f-2' },
        ]),
        roleConfig,
      },
    });
    const desc = container.querySelector('.cd-ai-chat-dialogue-annotation-content-description');
    expect(desc?.textContent).toContain('1');
  });

  // 对齐 Semi annotation.tsx:20/31：onClick 真实签名带原生点击事件（第一参数），
  // 本库原来只回传 annotation 数组，消费方拿不到事件对象，无法 e.stopPropagation()。
  it('onAnnotationClick 回传的内部 DialogueAnnotation onClick 支持事件参数', async () => {
    const onAnnotationClick = vi.fn();
    const { container } = renderWithLocale(AIChatDialogue, {
      props: {
        chats: withAnnotations([{ type: 'url_citation', title: 'a', url: 'https://a.com' }]),
        roleConfig,
        onAnnotationClick,
      },
    });
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-annotation-wrapper')!;
    await fireEvent.click(wrapper);
    expect(onAnnotationClick).toHaveBeenCalledTimes(1);
  });
});

// 内部半受控状态管理（对齐 Semi DialogueFoundation.likeMessage/dislikeMessage/
// resetMessage/editMessage/deleteMessage/onHintClick）：这六个操作在 Semi 里都是
// foundation 直接改 state.chats 并 notifyChatsChange，不是纯回调转发。本库原来
// 完全没有这层，点了都不会真的改变消息列表，与 Semi 交互结果不一致。
describe('AIChatDialogue · 内部状态管理（对齐 Semi foundation 各方法）', () => {
  it('点赞：图标从空心切实心，联动清空 dislike，且 onChatsChange 收到新 chats', async () => {
    const onChatsChange = vi.fn();
    const assistantDone: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'hi', status: 'completed', dislike: true } as AIDialogueMessage,
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig, onChatsChange },
    });
    const likeBtn = container.querySelector('button[aria-label="Good response"]') as HTMLButtonElement;
    expect(likeBtn.querySelector('.cd-icon-thumb_up_stroked')).not.toBeNull();
    await fireEvent.click(likeBtn);
    expect(likeBtn.querySelector('.cd-icon-like_thumb')).not.toBeNull();
    expect(onChatsChange).toHaveBeenCalledTimes(1);
    const next = onChatsChange.mock.calls[0]![0] as AIDialogueMessage[];
    const updated = next[0] as AIDialogueMessage & { like?: boolean; dislike?: boolean };
    expect(updated.like).toBe(true);
    expect(updated.dislike).toBe(false);
  });

  it('点踩：图标从空心切实心，联动清空 like', async () => {
    const assistantDone: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'hi', status: 'completed', like: true } as AIDialogueMessage,
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: assistantDone, roleConfig },
    });
    const dislikeBtn = container.querySelector('button[aria-label="Bad response"]') as HTMLButtonElement;
    await fireEvent.click(dislikeBtn);
    expect(dislikeBtn.querySelector('.cd-icon-like_thumb')).not.toBeNull();
    const likeBtn = container.querySelector('button[aria-label="Good response"]')!;
    expect(likeBtn.querySelector('.cd-icon-thumb_up_stroked')).not.toBeNull();
  });

  it('重置：最后一条消息换成新的 in_progress 空消息（新 id，非原消息 id）', async () => {
    const onChatsChange = vi.fn();
    const onMessageReset = vi.fn();
    const lastChat: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'old content', status: 'completed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: lastChat, roleConfig, showReset: true, onChatsChange, onMessageReset },
    });
    const resetBtn = container.querySelector('button[aria-label="Regenerate"]') as HTMLButtonElement;
    expect(resetBtn).not.toBeNull();
    await fireEvent.click(resetBtn);
    expect(onMessageReset).toHaveBeenCalledTimes(1);
    expect(onChatsChange).toHaveBeenCalledTimes(1);
    const next = onChatsChange.mock.calls[0]![0] as AIDialogueMessage[];
    expect(next).toHaveLength(1);
    expect(next[0]!.id).not.toBe('a1');
    expect(next[0]!.status).toBe('in_progress');
    expect(next[0]!.content).toBe('');
  });

  // 对齐 Semi dialogueContent.tsx loadingNode 的 isOutputExist：判断的是原始
  // message.content 是否为空，不是归一化后的 items.length——resetMessage 产出的
  // content:'' 被 normalizeDialogueContent 包成长度为 1 的空文本块，若用
  // items.length===0 判断会误判为「有内容」，走进正常渲染分支而不是 loading 态。
  it('重置后新消息 content:\'\' 渲染三点 loading，不是空的 MarkdownRender', async () => {
    const lastChat: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'old content', status: 'completed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: lastChat, roleConfig, showReset: true },
    });
    const resetBtn = container.querySelector('button[aria-label="Regenerate"]') as HTMLButtonElement;
    await fireEvent.click(resetBtn);
    const wrapper = container.querySelector('.cd-ai-chat-dialogue-wrapper')!;
    expect(
      wrapper.querySelectorAll('.cd-ai-chat-dialogue-content-loading-item'),
      '应渲染三点 loading',
    ).toHaveLength(3);
    expect(wrapper.querySelector('.cd-markdown-render')).toBeNull();
  });

  it('删除：确认弹窗点 OK 后从 chats 移除该消息', async () => {
    const onChatsChange = vi.fn();
    const onMessageDelete = vi.fn();
    const twoChats: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'first', status: 'completed' },
      { id: 'a2', role: 'assistant', content: 'second', status: 'completed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: twoChats, roleConfig, onChatsChange, onMessageDelete },
    });
    const moreBtn = container.querySelector('button[aria-label="More actions"]') as HTMLButtonElement;
    await fireEvent.click(moreBtn);
    await new Promise((r) => setTimeout(r, 0));
    const deleteItem = [...document.querySelectorAll('li[role="menuitem"]')].find((el) =>
      el.textContent?.includes('Delete'),
    ) as HTMLElement;
    expect(deleteItem, '应弹出「更多」下拉，含 Delete 项').not.toBeNull();
    await fireEvent.click(deleteItem);
    await new Promise((r) => setTimeout(r, 0));
    const okBtn = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Confirm');
    expect(okBtn, '应弹出确认 Modal').not.toBeNull();
    await fireEvent.click(okBtn!);
    await new Promise((r) => setTimeout(r, 0));
    expect(onMessageDelete).toHaveBeenCalledTimes(1);
    expect(onChatsChange).toHaveBeenCalledTimes(1);
    const next = onChatsChange.mock.calls[0]![0] as AIDialogueMessage[];
    expect(next.map((c) => c.id)).toEqual(['a2']);
  });

  // 对齐 Semi actionFoundation registerClickOutsideHandler/unregisterClickOutsideHandler：
  // 点击某条消息的「更多」触发器之外（含另一条消息的「更多」按钮）即关闭当前下拉。
  // 本库原来完全没有这层——Dropdown 用 trigger="custom" 时组件自身跳过内置的点击外部
  // 关闭逻辑（完全交给消费方），两个下拉各自独立的内部 state 互不影响，点开 A 再点 B，
  // A 不会自动收起。
  it('点开一条消息的「更多」后点另一条的「更多」，前一个自动关闭', async () => {
    const twoChats: AIDialogueMessage[] = [
      { id: 'a1', role: 'assistant', content: 'first', status: 'completed' },
      { id: 'a2', role: 'assistant', content: 'second', status: 'completed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: twoChats, roleConfig },
    });
    const moreBtns = [...container.querySelectorAll('button[aria-label="More actions"]')] as HTMLButtonElement[];
    expect(moreBtns).toHaveLength(2);

    await fireEvent.click(moreBtns[0]!);
    expect(moreBtns[0]!.getAttribute('aria-expanded')).toBe('true');

    // 互斥逻辑挂在 window mousedown 监听上，click 事件本身不含 mousedown，需显式派发。
    await fireEvent.mouseDown(moreBtns[1]!);
    await fireEvent.click(moreBtns[1]!);
    expect(moreBtns[0]!.getAttribute('aria-expanded'), '前一个下拉应自动关闭').toBe('false');
    expect(moreBtns[1]!.getAttribute('aria-expanded'), '当前点击的下拉应展开').toBe('true');
  });

  it('提示词点击：作为新 user 消息插入 chats（对齐 Semi foundation.onHintClick）', async () => {
    const onChatsChange = vi.fn();
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: [], roleConfig, hints: ['帮我总结这段'], onChatsChange },
    });
    await fireEvent.click(container.querySelector('.cd-ai-chat-dialogue-hint-item') as HTMLElement);
    expect(onChatsChange).toHaveBeenCalledTimes(1);
    const next = onChatsChange.mock.calls[0]![0] as AIDialogueMessage[];
    expect(next).toHaveLength(1);
    expect(next[0]!.role).toBe('user');
    expect(next[0]!.content).toBe('帮我总结这段');
    // 真的渲染出这条新消息（不只是回调层面）。
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper')).toHaveLength(1);
  });

  it('外部 chats prop 变化会同步覆盖内部状态（半受控闭环）', async () => {
    // 这条不测 locale 文案，直接用 testing-library 原生 render 绕开 renderWithLocale
    // 的 LocaleHarness 包装——LocaleHarness 自身有个叫 props 的合法字段，而
    // testing-library 的 rerender 把任何带 `props` 键的入参都当废弃写法剥壳，
    // 两者语义冲突，与 renderWithLocale 混用 rerender 时会取错值。
    const { rerender, container } = render(AIChatDialogue, {
      props: { chats: [{ id: 'a1', role: 'assistant', content: 'v1' }], roleConfig },
    });
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper')).toHaveLength(1);
    await rerender({
      chats: [
        { id: 'a1', role: 'assistant', content: 'v1' },
        { id: 'a2', role: 'assistant', content: 'v2' },
      ],
      roleConfig,
    });
    await tick();
    expect(container.querySelectorAll('.cd-ai-chat-dialogue-wrapper')).toHaveLength(2);
  });
});
