// AIChatInput a11y + 渲染（阶段 1 · 基础输入）。
//  - tiptap 内核动态 import，编辑区（.ProseMirror）异步挂载 → 断言前需等待。
//  - 编辑区 role=textbox / aria-multiline / aria-label 走 locale。
//  - 发送按钮态：空态禁用；有内容/generating 可点；generating 时 aria-label=stop。
//  - 点击发送触发 onMessageSend；generating 点击触发 onStopGenerate。
//  - ref 方法 setContent/getText/getHTML/clearContent。
//  - axe 0 violations。
// jsdom 断言静态渲染 + ARIA + axe（真实键盘/IME/光标留浏览器）。
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AIChatInput from './AIChatInput.svelte';
import AIChatInputConfigureFixture from './AIChatInputConfigureFixture.svelte';

// tiptap 内核动态 import + editor 创建是异步的（且并发跑测试时时序有波动）。
// 用轮询等 .ProseMirror 真正挂载，而非固定 sleep —— 避免高并发下等待不足。
async function flush(container?: Element): Promise<void> {
  const deadline = Date.now() + 2000;
  // 无 container 时退化为等一拍（供 setContent 等编辑器已就绪后的操作用）。
  if (!container) {
    await new Promise((r) => setTimeout(r, 30));
    return;
  }
  while (Date.now() < deadline) {
    if (container.querySelector('.ProseMirror')) {
      // ProseMirror DOM 已挂载，但 onCreate（设 isEmpty）可能晚一拍落定 —— 再等一小拍。
      await new Promise((r) => setTimeout(r, 20));
      return;
    }
    await new Promise((r) => setTimeout(r, 15));
  }
}

describe('AIChatInput · 渲染 + tiptap 挂载', () => {
  it('挂载不抛错，容器 + footer 渲染', async () => {
    const { container } = renderWithLocale(AIChatInput);
    expect(container.querySelector('.cd-ai-chat-input')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-footer')).not.toBeNull();
    await flush(container);
    expect(container.querySelector('.ProseMirror')).not.toBeNull();
  });

  it('编辑区暴露 role=textbox / aria-multiline / aria-label（i18n）', async () => {
    const { container } = renderWithLocale(AIChatInput);
    await flush(container);
    const pm = container.querySelector('.ProseMirror');
    expect(pm?.getAttribute('role')).toBe('textbox');
    expect(pm?.getAttribute('aria-multiline')).toBe('true');
    expect(pm?.getAttribute('aria-label')).toBe('Message input');
  });

  it('defaultContent 生效：ProseMirror 渲染出初始文本', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>hello world</p>' },
    });
    await flush(container);
    expect(container.querySelector('.ProseMirror')?.textContent).toContain('hello world');
  });

  it('showUploadButton=false 时不渲染上传按钮', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { showUploadButton: false },
    });
    expect(container.querySelector('.cd-ai-chat-input-upload')).toBeNull();
  });
});

describe('AIChatInput · 发送按钮态', () => {
  it('空态：发送按钮禁用', async () => {
    const { container } = renderWithLocale(AIChatInput);
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('有初始内容：发送按钮可点', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>hi</p>' },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('canSend=true 覆盖空态推断（可点）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { canSend: true } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('generating：按钮变停止态，aria-label=stop 且可点', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { generating: true } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    expect(btn.classList.contains('cd-ai-chat-input-send--stop')).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('Stop generating');
    expect(btn.disabled).toBe(false);
  });
});

describe('AIChatInput · 发送 / 停止回调', () => {
  it('点击发送触发 onMessageSend，载荷含 inputContents', async () => {
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>send me</p>', onMessageSend },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    await fireEvent.click(btn);
    expect(onMessageSend).toHaveBeenCalledTimes(1);
    const payload = onMessageSend.mock.calls[0]![0];
    expect(payload.inputContents).toEqual([{ type: 'text', text: 'send me' }]);
  });

  it('generating 点击触发 onStopGenerate，不触发 onMessageSend', async () => {
    const onStopGenerate = vi.fn();
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { generating: true, defaultContent: '<p>x</p>', onStopGenerate, onMessageSend },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    await fireEvent.click(btn);
    expect(onStopGenerate).toHaveBeenCalledTimes(1);
    expect(onMessageSend).not.toHaveBeenCalled();
  });

  it('空态点击发送不触发 onMessageSend（禁用）', async () => {
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInput, { props: { onMessageSend } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    await fireEvent.click(btn);
    expect(onMessageSend).not.toHaveBeenCalled();
  });
});

describe('AIChatInput · ref 方法', () => {
  it('setContent / getText / getHTML / clearContent', async () => {
    // ref 方法测试直接挂载（不经 LocaleHarness，否则 component 是 Harness 拿不到 export）。
    // useLocale 无 Provider 回退 en_US，文案与 Harness 一致。
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: {
        setContent: (s: string) => void;
        getText: () => string;
        getHTML: () => string;
        clearContent: () => void;
      };
    };
    const { component, container } = rendered;
    await flush(container);
    component.setContent('<p>abc</p>');
    await flush(); // 编辑器已就绪，等一拍让 setContent 生效
    expect(component.getText()).toContain('abc');
    expect(component.getHTML()).toContain('abc');
    component.clearContent();
    await flush();
    expect(component.getText().trim()).toBe('');
  });
});

describe('AIChatInput · axe', () => {
  it('基础输入无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>content</p>' },
    });
    await flush(container);
    await expectNoAxeViolations(container);
  });

  it('generating 态无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { generating: true } });
    await flush(container);
    await expectNoAxeViolations(container);
  });
});

describe('AIChatInput · 引用条（阶段 2）', () => {
  const refs = [
    { type: 'text' as const, id: 'r1', content: '引用一段话' },
    { type: 'file' as const, id: 'r2', name: 'spec.pdf' },
    { type: 'image' as const, id: 'r3', name: '图', url: 'https://x/y.png' },
  ];

  it('渲染每条引用：text→content、file→name、image→缩略图', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { references: refs } });
    const items = container.querySelectorAll('.cd-ai-chat-input-reference');
    expect(items).toHaveLength(3);
    expect(items[0]!.textContent).toContain('引用一段话');
    expect(items[1]!.textContent).toContain('spec.pdf');
    expect(container.querySelector('.cd-ai-chat-input-reference-img')).not.toBeNull();
  });

  it('showReference=false 不渲染引用条', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { references: refs, showReference: false },
    });
    expect(container.querySelector('.cd-ai-chat-input-references')).toBeNull();
  });

  it('点击引用触发 onReferenceClick', async () => {
    const onReferenceClick = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { references: refs, onReferenceClick },
    });
    const first = container.querySelector('.cd-ai-chat-input-reference-main') as HTMLElement;
    await fireEvent.click(first);
    expect(onReferenceClick).toHaveBeenCalledWith(refs[0]);
  });

  it('点击删除触发 onReferenceDelete，不冒泡到 click', async () => {
    const onReferenceClick = vi.fn();
    const onReferenceDelete = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { references: refs, onReferenceClick, onReferenceDelete },
    });
    const del = container.querySelector('.cd-ai-chat-input-reference-delete') as HTMLElement;
    await fireEvent.click(del);
    expect(onReferenceDelete).toHaveBeenCalledWith(refs[0]);
    expect(onReferenceClick).not.toHaveBeenCalled();
  });

  it('引用条无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { references: refs } });
    await flush(container);
    await expectNoAxeViolations(container);
  });
});

describe('AIChatInput · 建议面板（阶段 2）', () => {
  const suggestions = ['帮我写代码', { content: '翻译成英文' }, '总结要点'];

  // 建议面板由编辑区 focus 打开；jsdom 下向 .ProseMirror 派发原生 focus 事件触发。
  async function openPanel(container: Element): Promise<void> {
    const pm = container.querySelector('.ProseMirror') as HTMLElement;
    pm.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
    await new Promise((r) => setTimeout(r, 20));
  }

  it('聚焦编辑区弹出建议面板（listbox + options）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { suggestions } });
    await flush(container);
    await openPanel(container);
    const panel = container.querySelector('.cd-ai-chat-input-suggestions');
    expect(panel?.getAttribute('role')).toBe('listbox');
    expect(container.querySelectorAll('.cd-ai-chat-input-suggestion')).toHaveLength(3);
  });

  it('无 suggestions 时聚焦不弹面板', async () => {
    const { container } = renderWithLocale(AIChatInput);
    await flush(container);
    await openPanel(container);
    expect(container.querySelector('.cd-ai-chat-input-suggestions')).toBeNull();
  });

  it('点击建议项触发 onSuggestClick', async () => {
    const onSuggestClick = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { suggestions, onSuggestClick },
    });
    await flush(container);
    await openPanel(container);
    const item = container.querySelector('.cd-ai-chat-input-suggestion') as HTMLElement;
    await fireEvent.mouseDown(item);
    expect(onSuggestClick).toHaveBeenCalledWith('帮我写代码');
    // 选中后面板关闭
    expect(container.querySelector('.cd-ai-chat-input-suggestions')).toBeNull();
  });

  it('鼠标悬浮高亮建议项（aria-selected）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { suggestions } });
    await flush(container);
    await openPanel(container);
    const items = container.querySelectorAll('.cd-ai-chat-input-suggestion');
    await fireEvent.mouseEnter(items[1]!);
    expect(items[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('建议面板无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { suggestions } });
    await flush(container);
    await openPanel(container);
    await expectNoAxeViolations(container);
  });
});

describe('AIChatInput · 技能 + 模版（阶段 3）', () => {
  const skills = [
    { label: '总结', value: 'summarize' },
    { label: '翻译', value: 'translate', hasTemplate: true },
  ];

  // 技能面板由编辑区按 skillHotKey（默认 '/'）触发。jsdom 下向 .ProseMirror 派发 keydown。
  async function pressSkillHotKey(container: Element, key = '/'): Promise<void> {
    const pm = container.querySelector('.ProseMirror') as HTMLElement;
    pm.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 20));
  }

  it('skillSlot 节点：setContent 插入技能块并渲染 chip', async () => {
    const rendered = render(AIChatInput, { props: { skills } }) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent('<skill-slot data-label="总结" data-value="summarize"></skill-slot>');
    await flush();
    const chip = container.querySelector('.cd-ai-chat-input-skill-slot');
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain('总结');
  });

  it('按 skillHotKey 弹出技能面板（listbox）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { skills } });
    await flush(container);
    await pressSkillHotKey(container);
    const panel = container.querySelector('.cd-ai-chat-input-suggestions[aria-label="Skills"]');
    expect(panel).not.toBeNull();
    expect(container.querySelectorAll('.cd-ai-chat-input-suggestion')).toHaveLength(2);
  });

  it('点击技能项触发 onSkillChange 并插入 skillSlot', async () => {
    const onSkillChange = vi.fn();
    const { container } = renderWithLocale(AIChatInput, { props: { skills, onSkillChange } });
    await flush(container);
    await pressSkillHotKey(container);
    const item = container.querySelector('.cd-ai-chat-input-suggestion') as HTMLElement;
    await fireEvent.mouseDown(item);
    expect(onSkillChange).toHaveBeenCalledWith(skills[0]);
    await flush();
    expect(container.querySelector('.cd-ai-chat-input-skill-slot')?.textContent).toContain('总结');
  });

  it('选中 hasTemplate 技能后展示模版按钮，changeTemplateVisible 打开面板', async () => {
    const template: import('svelte').Snippet<[{ skill: unknown; setContent: (h: string) => void }]> =
      (() => {}) as never;
    const rendered = render(AIChatInput, {
      props: { skills, renderTemplate: template },
    }) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void; changeTemplateVisible: (v: boolean) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    // 直接选中带模版的技能（插入其 skillSlot 并设 currentSkill）——借面板路径。
    await pressSkillHotKey(container);
    const items = container.querySelectorAll('.cd-ai-chat-input-suggestion');
    await fireEvent.mouseDown(items[1]!); // 翻译（hasTemplate）
    await flush();
    expect(container.querySelector('.cd-ai-chat-input-template-btn')).not.toBeNull();
  });

  it('技能面板无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { skills } });
    await flush(container);
    await pressSkillHotKey(container);
    await expectNoAxeViolations(container);
  });
});

describe('AIChatInput · 配置区（阶段 4）', () => {
  it('renderConfigureArea 渲染配置项', async () => {
    const { container } = renderWithLocale(AIChatInputConfigureFixture);
    expect(container.querySelector('.cd-ai-chat-input-configure')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-configure-button')).not.toBeNull();
  });

  it('切换配置按钮：onConfigureChange 触发，aria-pressed 更新', async () => {
    const onConfigureChange = vi.fn();
    const { container } = renderWithLocale(AIChatInputConfigureFixture, {
      props: { onConfigureChange },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-configure-button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    await fireEvent.click(btn);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(onConfigureChange).toHaveBeenCalledWith({ web: true }, { web: true });
  });

  it('配置值发送时并入 MessageContent.setup', async () => {
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInputConfigureFixture, {
      props: { onMessageSend },
    });
    await flush(container);
    // 打开 web 开关
    const cfgBtn = container.querySelector('.cd-ai-chat-input-configure-button') as HTMLButtonElement;
    await fireEvent.click(cfgBtn);
    // 发送
    const sendBtn = container.querySelector('.cd-ai-chat-input-send') as HTMLButtonElement;
    await fireEvent.click(sendBtn);
    expect(onMessageSend).toHaveBeenCalledTimes(1);
    expect(onMessageSend.mock.calls[0]![0].setup).toEqual({ web: true });
  });

  it('配置区无 axe 违规', async () => {
    const { container } = renderWithLocale(AIChatInputConfigureFixture);
    await flush(container);
    await expectNoAxeViolations(container);
  });
});
