// AIChatDialogue a11y + 渲染：OpenAI 消息格式对话展示。
//  - 消息流容器 role=log / aria-live=polite / aria-label 走 locale。
//  - ContentItem 分块渲染：output_text→MarkdownRender、reasoning 折叠、function_call 工具块。
//  - 选择模式：checkbox 前置。
//  - axe 0 violations。
// jsdom 断言静态渲染 + ARIA + axe（真实滚动/回到底部留浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AIChatDialogue from './AIChatDialogue.svelte';
import AIChatDialogueEditFixture from './AIChatDialogueEditFixture.svelte';
import type { AIDialogueMessage, AIDialogueRoleConfig } from '@chenzy-design/core';

const roleConfig: AIDialogueRoleConfig = {
  user: { name: '我', color: '#4080ff' },
  assistant: { name: '助手', color: '#00b42a' },
};

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
    await expectNoAxeViolations(container);
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
    // function_call 工具块名称渲染。
    const tool = container.querySelector('.cd-ai-chat-dialogue-content-tool-call-name');
    expect(tool?.textContent).toBe('get_weather');
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
    await expectNoAxeViolations(container);
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

  it('error 状态渲染错误文案（走 locale 非 key）', async () => {
    const errorChats: AIDialogueMessage[] = [
      { id: 'e1', role: 'assistant', content: [], status: 'failed' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: errorChats, roleConfig },
    });
    const err = container.querySelector('.cd-ai-chat-dialogue-content-failed-text');
    expect(err?.textContent).toBeTruthy();
    expect(err?.textContent).not.toBe('AIChatDialogue.error');
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
    // 编辑态不显示操作按钮
    expect(container.querySelector('button[aria-label="Edit"]')).toBeNull();
  });

  it('editing 态无 axe 违规', async () => {
    const editing: AIDialogueMessage[] = [{ ...editChats[0]!, editing: true }];
    const { container } = renderWithLocale(AIChatDialogueEditFixture, {
      props: { chats: editing },
    });
    await expectNoAxeViolations(container);
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

  it('工具块默认折叠：header 显示名称 + 状态图标，body 未展开', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: toolChats, roleConfig },
    });
    const header = container.querySelector('.cd-ai-chat-dialogue-content-tool-call-header');
    expect(header?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-name')?.textContent).toBe('get_weather');
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-status')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-body')).toBeNull();
  });

  it('点击展开：显示格式化参数 + 输出 + call_id', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: toolChats, roleConfig },
    });
    const header = container.querySelector('.cd-ai-chat-dialogue-content-tool-call-header') as HTMLButtonElement;
    await fireEvent.click(header);
    expect(header.getAttribute('aria-expanded')).toBe('true');
    const args = container.querySelectorAll('.cd-ai-chat-dialogue-content-tool-call-args');
    // 参数 + 输出各一个 pre，且 JSON 已格式化（含换行缩进）
    expect(args.length).toBe(2);
    expect(args[0]!.textContent).toContain('"city": "SF"');
    expect(args[1]!.textContent).toContain('"temp": 20');
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-id')?.textContent).toBe('call_1');
  });

  it('in_progress 状态：running 标记', async () => {
    const running: AIDialogueMessage[] = [
      { id: 'a', role: 'assistant', content: [{ type: 'mcp_call', name: 'search', arguments: '{', status: 'in_progress', server_label: 'fs' }], status: 'in_progress' },
    ];
    const { container } = renderWithLocale(AIChatDialogue, { props: { chats: running, roleConfig } });
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-running')).not.toBeNull();
    // MCP server 标识渲染
    expect(container.querySelector('.cd-ai-chat-dialogue-content-tool-call-server')?.textContent).toBe('fs');
  });

  it('工具块展开态无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: toolChats, roleConfig },
    });
    const header = container.querySelector('.cd-ai-chat-dialogue-content-tool-call-header') as HTMLButtonElement;
    await fireEvent.click(header);
    await expectNoAxeViolations(container);
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
    await expectNoAxeViolations(container);
  });
});

// 对话内代码块（对齐 Semi widgets/contentItem/code.tsx）。
// 本库此前没有这个覆盖：围栏代码块走 MarkdownRender 默认 MdPre，没有语言标签栏也没有复制按钮。
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
    await expectNoAxeViolations(container);
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
    await expectNoAxeViolations(container);
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
    await expectNoAxeViolations(container);
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
    await expectNoAxeViolations(container);
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

// continueSend：与上一条同角色的连续发言，隐藏头像占位 + 不渲染标题。
// 本库此前只在注释里提过这个概念，实际从未接线。
describe('AIChatDialogue · continueSend 连续发言（对齐 Semi index.tsx:331）', () => {
  const sameRole: AIDialogueMessage[] = [
    { id: 'a1', role: 'assistant', content: '第一句' },
    { id: 'a2', role: 'assistant', content: '第二句' },
    { id: 'u1', role: 'user', content: '我的话' },
  ];

  it('同角色第二条：头像加 -avatar-hidden 且不渲染标题', () => {
    const { container } = renderWithLocale(AIChatDialogue, {
      props: { chats: sameRole, roleConfig },
    });
    const wrappers = container.querySelectorAll('.cd-ai-chat-dialogue-wrapper');
    // 第 1 条（首条）：正常头像 + 有标题。
    expect(
      wrappers[0]!.querySelector('.cd-ai-chat-dialogue-avatar-hidden'),
    ).toBeNull();
    expect(wrappers[0]!.querySelector('.cd-ai-chat-dialogue-title')).not.toBeNull();
    // 第 2 条（同角色连发）：头像隐藏 + 无标题 + wrapper 带 -continue-send。
    expect(
      wrappers[1]!.querySelector('.cd-ai-chat-dialogue-avatar-hidden'),
    ).not.toBeNull();
    expect(wrappers[1]!.querySelector('.cd-ai-chat-dialogue-title')).toBeNull();
    expect(
      wrappers[1]!.classList.contains('cd-ai-chat-dialogue-wrapper-continue-send'),
    ).toBe(true);
    // 第 3 条换了角色 → 恢复正常。
    expect(
      wrappers[2]!.querySelector('.cd-ai-chat-dialogue-avatar-hidden'),
    ).toBeNull();
    expect(wrappers[2]!.querySelector('.cd-ai-chat-dialogue-title')).not.toBeNull();
  });
});
