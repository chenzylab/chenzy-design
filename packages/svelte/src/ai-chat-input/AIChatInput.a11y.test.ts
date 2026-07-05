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
    if (container.querySelector('.ProseMirror')) return;
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
    const payload = onMessageSend.mock.calls[0][0];
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
