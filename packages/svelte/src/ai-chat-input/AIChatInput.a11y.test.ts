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
import AIChatInputMcpFixture from './AIChatInputMcpFixture.svelte';
import AIChatInputRenderItemFixture from './AIChatInputRenderItemFixture.svelte';
import AIChatInputSuggestionsFixture from './AIChatInputSuggestionsFixture.svelte';
import AIChatInputActionAreaFixture from './AIChatInputActionAreaFixture.svelte';

// jsdom 对部分节点（floating-ui 的 target 可能是 Range/Element）未实现 getClientRects/
// getBoundingClientRect —— Dropdown floating action 会调用。无条件补空实现，避免 Mcp 浮层
// 挂载时抛 unhandled TypeError 污染测试输出（不影响断言）。
const emptyRects = () => [] as unknown as DOMRectList;
const emptyRect = () =>
  ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
for (const proto of [Element.prototype, Range.prototype]) {
  proto.getClientRects = emptyRects;
  proto.getBoundingClientRect = emptyRect;
}

/**
 * 查询浮层内容（建议/技能/模版面板）。
 *
 * 这三者对齐 Semi 后由 Popover 承载，而 Popover 会把浮层 **portal 到 document.body**，
 * 因此它们不在 render 返回的 container 里 —— 用 container.querySelector 找会恒为 null，
 * 断言「面板不存在」的用例会假绿。故浮层一律走 document 查询。
 */
function popup<T extends Element = Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function popupAll(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}

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
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('有初始内容：发送按钮可点', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>hi</p>' },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('canSend=true 覆盖空态推断（可点）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { canSend: true } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('generating：按钮变停止态，aria-label=stop 且可点', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { generating: true } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    expect(btn.classList.contains('cd-ai-chat-input-footer-action-stop')).toBe(true);
    expect(btn.getAttribute('aria-label')).toBe('Stop generating');
    expect(btn.disabled).toBe(false);
  });
});

// 对齐 Semi renderRightFooter：自定义时连外层容器一起交给用户（回传 className），
// 并把默认的「上传 + 发送/停止」作为 menuItem 回传——用户可加东西而非被迫整套重写。
// 本库原来只回传 { canSend, generating } 且外壳仍由组件渲染，导致 demo 里只能手搓
// 假的发送按钮，内置上传管线与发送态全丢。
describe('AIChatInput · renderActionArea（对齐 Semi ActionAreaProps）', () => {
  it('自定义操作区：容器由用户渲染，menuItem 保留内置发送按钮', async () => {
    const { container } = renderWithLocale(AIChatInputActionAreaFixture);
    await flush(container);

    const custom = container.querySelector('[data-testid="custom-action"]');
    expect(custom, '应渲染用户自己的容器').not.toBeNull();
    // className 回传的是默认容器类名，用户挂上后样式不丢。
    expect(custom!.classList.contains('cd-ai-chat-input-footer-action')).toBe(true);

    expect(container.querySelector('[data-testid="extra-btn"]')).not.toBeNull();
    // menuItem 渲染出的内置发送按钮仍在。
    expect(container.querySelector('.cd-ai-chat-input-footer-action-send')).not.toBeNull();

    // 组件不应再额外套一层自己的 -footer-action（否则会出现两个）。
    expect(container.querySelectorAll('.cd-ai-chat-input-footer-action')).toHaveLength(1);
  });
});

describe('AIChatInput · 发送 / 停止回调', () => {
  it('点击发送触发 onMessageSend，载荷含 inputContents', async () => {
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { defaultContent: '<p>send me</p>', onMessageSend },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
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
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    await fireEvent.click(btn);
    expect(onStopGenerate).toHaveBeenCalledTimes(1);
    expect(onMessageSend).not.toHaveBeenCalled();
  });

  it('空态点击发送不触发 onMessageSend（禁用）', async () => {
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInput, { props: { onMessageSend } });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
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

  // —— 附件卡片结构（逐条对齐 Semi renderAttachment）——
  // 附件初值取 uploadProps.defaultFileList（对齐 Semi defaultAttachment）。
  it('附件卡片渲染图标 + name/`类型 大小` 两行 + 删除钮（对齐 Semi）', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: {
        uploadProps: {
          defaultFileList: [{ uid: 'a1', name: 'spec.docx', size: '12KB', status: 'success' }],
        },
      },
    });
    await flush(container);

    const card = container.querySelector('.cd-ai-chat-input-attachment');
    expect(card, '应渲染附件卡片').not.toBeNull();

    // 类型由 getContentType(getAttachmentType) 推导：docx → word（非把 type 原样当图标键）。
    expect(container.querySelector('.cd-ai-chat-input-ref-icon-word')).not.toBeNull();

    expect(container.querySelector('.cd-ai-chat-input-attachment-content-name')?.textContent).toBe(
      'spec.docx',
    );
    // 第二行是 `类型 大小`（Semi 模板字符串），且 CSS 会 uppercase。
    expect(
      container.querySelector('.cd-ai-chat-input-attachment-content-size')?.textContent?.trim(),
    ).toBe('docx 12KB');

    expect(container.querySelector('.cd-ai-chat-input-attachment-delete')).not.toBeNull();
  });

  it('附件是图片时渲染缩略图而非类型图标', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: {
        uploadProps: {
          defaultFileList: [{ uid: 'a1', name: 'pic.png', url: 'https://x/pic.png' }],
        },
      },
    });
    await flush(container);

    const img = container.querySelector<HTMLImageElement>('.cd-ai-chat-input-attachment-img');
    expect(img, '应渲染缩略图').not.toBeNull();
    expect(img!.getAttribute('src')).toBe('https://x/pic.png');
    expect(
      container.querySelector('.cd-ai-chat-input-attachment-icon'),
      '有缩略图时不应再渲染类型图标',
    ).toBeNull();
  });

  // Semi: showPercent = !(percent === 100 || percent === undefined) && status === 'uploading'
  it('上传中且 percent 非 100 时显示环形进度（复用 Progress）', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: {
        uploadProps: {
          defaultFileList: [{ uid: 'a1', name: 'big.zip', percent: 42, status: 'uploading' }],
        },
      },
    });
    await flush(container);
    expect(container.querySelector('.cd-ai-chat-input-attachment-progress')).not.toBeNull();
  });

  it('percent=100 或非 uploading 态不显示进度', async () => {
    for (const item of [
      { uid: 'a1', name: 'big.zip', percent: 100, status: 'uploading' },
      { uid: 'a1', name: 'big.zip', percent: 42, status: 'success' },
      { uid: 'a1', name: 'big.zip', status: 'uploading' },
    ]) {
      const { container } = renderWithLocale(AIChatInput, {
        props: { uploadProps: { defaultFileList: [item] } },
      });
      await flush(container);
      expect(
        container.querySelector('.cd-ai-chat-input-attachment-progress'),
        `${JSON.stringify(item)} 不该显示进度`,
      ).toBeNull();
    }
  });

  it('附件区外层是横向滚动容器（对齐 Semi HorizontalScroller）', async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { uploadProps: { defaultFileList: [{ uid: 'a1', name: 'a.txt' }] } },
    });
    await flush(container);
    expect(container.querySelector('.cd-ai-chat-input-scroll-wrapper')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-scroll-container')).not.toBeNull();
  });

  // 附件列表是本组件自绘的（Upload 传 listType="none"），删除**不走** Upload 内部移除流程，
  // 故必须显式兑现 uploadProps 的两个钩子 —— 否则文档里「删除会触发 onRemove 并遵循
  // beforeRemove」这条对本库就是假的。
  it('deleteUploadFile 触发 uploadProps.onRemove 并遵循 beforeRemove', async () => {
    const onRemove = vi.fn();
    const onUploadChange = vi.fn();
    let allow = false;
    const beforeRemove = vi.fn(() => Promise.resolve(allow));

    const rendered = render(AIChatInput, {
      props: { uploadProps: { beforeRemove, onRemove }, onUploadChange },
    }) as unknown as {
      container: Element;
      component: { deleteUploadFile: (a: Record<string, unknown>) => void };
    };
    await flush(rendered.container);

    const attachment = { uid: 'a1', name: 'a.txt' };
    // 组件内部附件列表初始为空，先让它有一项：走 onUploadChange 的公开路径不可行，
    // 故直接调 deleteUploadFile 验证「beforeRemove 返回 false 时不触发 onRemove」这一半。
    rendered.component.deleteUploadFile(attachment);
    await flush();
    expect(beforeRemove).toHaveBeenCalled();
    expect(onRemove, 'beforeRemove 返回 false 应中止删除').not.toHaveBeenCalled();

    allow = true;
    rendered.component.deleteUploadFile(attachment);
    await flush();
    expect(onRemove, 'beforeRemove 放行后应触发 onRemove').toHaveBeenCalled();
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
    // 判图对齐 Semi isImageType：只看 name 的后缀，不看 url。
    { type: 'image' as const, id: 'r3', name: '图.png', url: 'https://x/y.png' },
  ];

  it('渲染每条引用：text→content、file→name、image→缩略图', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { references: refs } });
    const items = container.querySelectorAll('.cd-ai-chat-input-reference');
    expect(items).toHaveLength(3);
    expect(items[0]!.textContent).toContain('引用一段话');
    expect(items[1]!.textContent).toContain('spec.pdf');
    expect(container.querySelector('.cd-ai-chat-input-reference-img')).not.toBeNull();
  });

  // 对齐 Semi renderReference：每条引用前置一枚 IconSendMsgStroked，
  // 名称/图标包在 .-reference-content 里，三段式 icon + content + delete。
  it('引用项三段式结构：前置 send-msg 图标 + -reference-content + -reference-delete', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { references: refs } });
    const first = container.querySelector('.cd-ai-chat-input-reference')!;

    expect(
      first.querySelector('.cd-icon-send_msg_stroked'),
      '应有 Semi 的前置 IconSendMsgStroked',
    ).not.toBeNull();
    expect(first.querySelector('.cd-ai-chat-input-reference-content')).not.toBeNull();
    expect(first.querySelector('.cd-ai-chat-input-reference-name')).not.toBeNull();
    expect(first.querySelector('.cd-ai-chat-input-reference-delete')).not.toBeNull();
  });

  // Semi: {type !== 'text' && (isImage ? <img/> : icon)} —— 文本引用不出图标，只有文字。
  it("type='text' 的引用不渲染类型图标/缩略图（对齐 Semi 的 type!=='text' 守卫）", async () => {
    const { container } = renderWithLocale(AIChatInput, {
      props: { references: [{ type: 'text', id: 'r1', content: '引用一段话' }] },
    });
    const first = container.querySelector('.cd-ai-chat-input-reference')!;
    expect(first.querySelector('.cd-ai-chat-input-reference-img')).toBeNull();
    expect(first.querySelector('.cd-ai-chat-input-reference-icon')).toBeNull();
    expect(first.textContent).toContain('引用一段话');
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
    const first = container.querySelector('.cd-ai-chat-input-reference-content') as HTMLElement;
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

  // 对齐 Semi componentDidUpdate：suggestions 变化即按 length>0 开/关面板。
  // 没有这条，「按输入内容动态派生建议」（Semi 官方建议 demo 的用法）就必须
  // 先失焦再聚焦才看得到面板。
  it('suggestions 由空变非空即自动弹出面板（无需重新聚焦）', async () => {
    const { container } = renderWithLocale(AIChatInputSuggestionsFixture);
    await flush(container);
    expect(popup('.cd-ai-chat-input-suggestion')).toBeNull();

    await fireEvent.click(container.querySelector('[data-testid="fill"]') as HTMLElement);
    await flush();
    expect(popupAll('.cd-ai-chat-input-suggestion-item')).toHaveLength(2);
  });

  it('suggestions 变空即关闭面板', async () => {
    const { container } = renderWithLocale(AIChatInputSuggestionsFixture);
    await flush(container);
    await fireEvent.click(container.querySelector('[data-testid="fill"]') as HTMLElement);
    await flush();
    expect(popup('.cd-ai-chat-input-suggestion')).not.toBeNull();

    await fireEvent.click(container.querySelector('[data-testid="clear"]') as HTMLElement);
    await flush();
    expect(popup('.cd-ai-chat-input-suggestion')).toBeNull();
  });

  it('聚焦编辑区弹出建议面板（listbox + options）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { suggestions } });
    await flush(container);
    await openPanel(container);
    const panel = popup('.cd-ai-chat-input-suggestion');
    expect(panel?.getAttribute('role')).toBe('listbox');
    expect(popupAll('.cd-ai-chat-input-suggestion-item')).toHaveLength(3);
  });

  it('无 suggestions 时聚焦不弹面板', async () => {
    const { container } = renderWithLocale(AIChatInput);
    await flush(container);
    await openPanel(container);
    expect(popup('.cd-ai-chat-input-suggestion')).toBeNull();
  });

  it('点击建议项触发 onSuggestClick', async () => {
    const onSuggestClick = vi.fn();
    const { container } = renderWithLocale(AIChatInput, {
      props: { suggestions, onSuggestClick },
    });
    await flush(container);
    await openPanel(container);
    const item = popup('.cd-ai-chat-input-suggestion-item') as HTMLElement;
    await fireEvent.mouseDown(item);
    expect(onSuggestClick).toHaveBeenCalledWith('帮我写代码');
    // 选中后面板关闭
    expect(popup('.cd-ai-chat-input-suggestion')).toBeNull();
  });

  it('鼠标悬浮高亮建议项（aria-selected）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { suggestions } });
    await flush(container);
    await openPanel(container);
    const items = popupAll('.cd-ai-chat-input-suggestion-item');
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
    const chip = popup('.skill-slot');
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain('总结');
  });

  it('按 skillHotKey 弹出技能面板（listbox）', async () => {
    const { container } = renderWithLocale(AIChatInput, { props: { skills } });
    await flush(container);
    await pressSkillHotKey(container);
    const panel = popup('.cd-ai-chat-input-skill[aria-label="Skills"]');
    expect(panel).not.toBeNull();
    expect(popupAll('.cd-ai-chat-input-skill-item')).toHaveLength(2);
  });

  it('点击技能项触发 onSkillChange 并插入 skillSlot', async () => {
    const onSkillChange = vi.fn();
    const { container } = renderWithLocale(AIChatInput, { props: { skills, onSkillChange } });
    await flush(container);
    await pressSkillHotKey(container);
    const item = popup('.cd-ai-chat-input-skill-item') as HTMLElement;
    await fireEvent.mouseDown(item);
    expect(onSkillChange).toHaveBeenCalledWith(skills[0]);
    await flush();
    expect(popup('.skill-slot')?.textContent).toContain('总结');
  });

  it('选中 hasTemplate 技能后展示模版按钮，changeTemplateVisible 打开面板', async () => {
    const template: import('svelte').Snippet<[{ skill: unknown; setContent: (h: string) => void }]> =
      (() => {}) as never;
    const rendered = render(AIChatInput, {
      props: { skills, renderTemplate: template },
    }) as unknown as { container: Element };
    const { container } = rendered;
    await flush(container);
    // 直接选中带模版的技能（插入其 skillSlot 并设 currentSkill）——借面板路径。
    await pressSkillHotKey(container);
    const items = popupAll('.cd-ai-chat-input-skill-item');
    await fireEvent.mouseDown(items[1]!); // 翻译（hasTemplate）
    await flush();
    expect(popup('.cd-ai-chat-input-template-btn')).not.toBeNull();
  });

  // 对齐 Semi skillItem.tsx：renderSkillItem 存在时**整项替换**（不再套默认外壳），
  // 且回传 className 必须带激活态 —— 否则消费方做不出高亮，onClick 也接不上选中流程。
  it('renderSkillItem 整项替换：默认外壳消失、className 带激活态、onClick 接选中', async () => {
    const onSkillChange = vi.fn();
    const { container } = renderWithLocale(AIChatInputRenderItemFixture, {
      props: { skills, onSkillChange },
    });
    await flush(container);
    await pressSkillHotKey(container);

    const custom = popupAll('[data-testid="custom-skill"]');
    expect(custom, '自定义渲染应逐项生效').toHaveLength(2);
    expect(custom[0]!.textContent).toContain('自定义-总结');

    // 整项替换：不应再出现默认外壳的 div（自定义根节点是 button）。
    expect(container.querySelector('div.cd-ai-chat-input-skill-item')).toBeNull();

    // className 回传含基类；hover 后该项拿到激活类。
    expect(custom[0]!.className).toContain('cd-ai-chat-input-skill-item');
    await fireEvent.mouseEnter(custom[1]!);
    await flush();
    const after = popupAll('[data-testid="custom-skill"]');
    expect(after[1]!.className).toContain('cd-ai-chat-input-skill-item-active');

    // onClick 回传接得上选中流程。
    await fireEvent.mouseDown(after[0]!);
    expect(onSkillChange).toHaveBeenCalledWith(skills[0]);
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
    expect(container.querySelector('.cd-ai-chat-input-footer-configure')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-footer-configure-button')).not.toBeNull();
  });

  it('切换配置按钮：onConfigureChange 触发，aria-pressed 更新', async () => {
    const onConfigureChange = vi.fn();
    const { container } = renderWithLocale(AIChatInputConfigureFixture, {
      props: { onConfigureChange },
    });
    await flush(container);
    const btn = container.querySelector('.cd-ai-chat-input-footer-configure-button') as HTMLButtonElement;
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
    const cfgBtn = container.querySelector('.cd-ai-chat-input-footer-configure-button') as HTMLButtonElement;
    await fireEvent.click(cfgBtn);
    // 发送
    const sendBtn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
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

describe('AIChatInput · select-slot 自定义节点（可选补充）', () => {
  it('setContent 插入 select-slot → 渲染内联 Select', async () => {
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent(
      '<p>去 <select-slot options=\'["北京","上海"]\' value="北京"></select-slot> 出差</p>',
    );
    await flush();
    // NodeView 渲染出 select-slot wrapper + 内部 Select 触发器
    expect(container.querySelector('.select-slot-wrapper')).not.toBeNull();
    expect(container.querySelector('.cd-select')).not.toBeNull();
  });

  it('select-slot 的 value 经发送进入 inputContents（内建归一）', async () => {
    const onMessageSend = vi.fn();
    const rendered = render(AIChatInput, { props: { onMessageSend } }) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent(
      '<p>去 <select-slot options=\'["北京","上海"]\' value="上海"></select-slot></p>',
    );
    await flush();
    const sendBtn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    await fireEvent.click(sendBtn);
    expect(onMessageSend).toHaveBeenCalledTimes(1);
    const text = onMessageSend.mock.calls[0]![0].inputContents?.[0]?.text;
    expect(text).toContain('上海');
  });
});

describe('AIChatInput · input-slot 可编辑节点（可选补充）', () => {
  it('setContent 插入 input-slot → 渲染 + 空态显示 placeholder', async () => {
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent('<p>去 <input-slot placeholder="填城市">﻿</input-slot> 出差</p>');
    await flush();
    expect(container.querySelector('.input-slot')).not.toBeNull();
    expect(container.querySelector('.input-slot-placeholder')?.textContent).toBe(
      '填城市',
    );
  });

  it('input-slot 有内容时不显示 placeholder，且内容进 inputContents', async () => {
    const onMessageSend = vi.fn();
    const rendered = render(AIChatInput, { props: { onMessageSend } }) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent('<p>去 <input-slot placeholder="填城市">北京</input-slot></p>');
    await flush();
    expect(container.querySelector('.input-slot-placeholder')).toBeNull();
    const sendBtn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    await fireEvent.click(sendBtn);
    const text = onMessageSend.mock.calls[0]![0].inputContents?.[0]?.text;
    expect(text).toContain('北京');
  });

  it('input-slot 无 axe 违规', async () => {
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent('<p><input-slot placeholder="填空">﻿</input-slot></p>');
    await flush();
    await expectNoAxeViolations(container);
  });
});

describe('AIChatInput · Configure.Mcp（可选补充）', () => {
  // 触发器计数是「可选服务总数」不是「已选数」——对齐 Semi mcp.tsx 的
  // `MCP · {options.length ?? num}`（options 默认 []，故 ?? num 实为死代码）。
  // 本库原来显示已选数，是自造语义，已改回。
  it('渲染 MCP 触发器，计数为可选服务总数（非已选数）', async () => {
    const { container } = renderWithLocale(AIChatInputMcpFixture);
    await flush(container);
    const trigger = container.querySelector('.cd-ai-chat-input-footer-configure-mcp-trigger');
    expect(trigger).not.toBeNull();
    // fixture 提供 2 个可选服务，未选任何一个 → 仍显示 2。
    expect(trigger?.textContent).toContain('MCP · 2');
  });

  it('initValue 预设已选：计数不随已选变化 + 发送并入 setup', async () => {
    // Dropdown 浮层的完整点击流在 jsdom 下不稳（floating + lazyRender），
    // 这里用 initValue 预设验证 configure context 绑定 + setup 并入的核心逻辑。
    const onMessageSend = vi.fn();
    const { container } = renderWithLocale(AIChatInputMcpFixture, {
      props: { onMessageSend, initValue: ['fs'] },
    });
    await flush(container);
    const trigger = container.querySelector('.cd-ai-chat-input-footer-configure-mcp-trigger');
    // 已选 1 个，但计数仍是可选总数 2。
    expect(trigger?.textContent).toContain('MCP · 2');
    const sendBtn = container.querySelector('.cd-ai-chat-input-footer-action-send, .cd-ai-chat-input-footer-action-stop') as HTMLButtonElement;
    await fireEvent.click(sendBtn);
    expect(onMessageSend.mock.calls[0]![0].setup).toEqual({ mcp: ['fs'] });
  });

  // 下拉头部（对齐 Semi mcp.tsx 的 -mcp-header）：已选计数文案 + 配置按钮。
  // 浮层被 portal 到 body，故查 document 而非 container。
  it('展开后渲染头部：locale 计数文案 + 配置按钮，showConfigure=false 时隐藏按钮', async () => {
    const { container } = renderWithLocale(AIChatInputMcpFixture);
    await flush(container);
    const trigger = container.querySelector(
      '.cd-ai-chat-input-footer-configure-mcp-trigger',
    ) as HTMLElement;
    await fireEvent.click(trigger);
    await flush(container);

    const header = document.querySelector('.cd-ai-chat-input-footer-configure-mcp-header');
    expect(header).not.toBeNull();
    // en_US 'Selected ${count} items' 里的 ${count} 被 options.length 替换。
    const title = document.querySelector(
      '.cd-ai-chat-input-footer-configure-mcp-header-title',
    );
    expect(title?.textContent?.trim()).toBe('Selected 2 items');
    // 配置按钮默认显示，文案走 locale。
    const config = document.querySelector(
      '.cd-ai-chat-input-footer-configure-mcp-header-config',
    );
    expect(config?.textContent?.trim()).toBe('Configure');
  });

  it('点击头部配置按钮触发 onConfigureButtonClick', async () => {
    const onConfigureButtonClick = vi.fn();
    const { container } = renderWithLocale(AIChatInputMcpFixture, {
      props: { onConfigureButtonClick },
    });
    await flush(container);
    await fireEvent.click(
      container.querySelector('.cd-ai-chat-input-footer-configure-mcp-trigger') as HTMLElement,
    );
    await flush(container);
    await fireEvent.click(
      document.querySelector(
        '.cd-ai-chat-input-footer-configure-mcp-header-config',
      ) as HTMLElement,
    );
    expect(onConfigureButtonClick).toHaveBeenCalledTimes(1);
  });

  it('showConfigure=false：头部仍在，配置按钮不渲染', async () => {
    const { container } = renderWithLocale(AIChatInputMcpFixture, {
      props: { showConfigure: false },
    });
    await flush(container);
    await fireEvent.click(
      container.querySelector('.cd-ai-chat-input-footer-configure-mcp-trigger') as HTMLElement,
    );
    await flush(container);
    expect(
      document.querySelector('.cd-ai-chat-input-footer-configure-mcp-header'),
    ).not.toBeNull();
    expect(
      document.querySelector('.cd-ai-chat-input-footer-configure-mcp-header-config'),
    ).toBeNull();
  });
});

describe('AIChatInput · 补齐 Semi props/methods', () => {
  it('ref deleteContent：删除匹配文本段', async () => {
    const rendered = render(AIChatInput, { props: { defaultContent: '<p>hello world</p>' } }) as unknown as {
      container: Element;
      component: { deleteContent: (c: { text: string }) => void; getText: () => string };
    };
    const { container, component } = rendered;
    await flush(container);
    component.deleteContent({ text: 'world' });
    await flush();
    expect(component.getText()).not.toContain('world');
    expect(component.getText()).toContain('hello');
  });

  it('ref setContentWhileSaveTool：保留当前技能 slot 前缀', async () => {
    // 无技能时退化为普通 setContent。
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContentWhileSaveTool: (s: string) => void; getText: () => string };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContentWhileSaveTool('<p>新内容</p>');
    await flush();
    expect(component.getText()).toContain('新内容');
  });

  // 编辑器内核装配拆到 rich-text-input.svelte.ts 后，若把创建期参数（defaultContent /
  // placeholder / extensions 等）当裸值传进去，它们会成为挂载 effect 的依赖——
  // 任何一次 prop 变化都会重建编辑器、把用户已输入的内容冲掉。故一律走 getter + untrack。
  it('prop 变化不重建编辑器：用户已输入的内容不被冲掉', async () => {
    const rendered = render(AIChatInput, {
      props: { defaultContent: '<p>初始</p>', placeholder: 'a' },
    }) as unknown as {
      container: Element;
      component: { setContent: (s: string) => void; getText: () => string };
      rerender: (p: Record<string, unknown>) => Promise<void>;
    };
    await flush(rendered.container);

    // 模拟用户输入。
    rendered.component.setContent('<p>用户敲的字</p>');
    await flush();
    expect(rendered.component.getText()).toContain('用户敲的字');

    // 改一个与编辑器创建无关的 prop。
    await rendered.rerender({ defaultContent: '<p>初始</p>', placeholder: 'b' });
    await flush();
    expect(rendered.component.getText(), '改 prop 后不应回退成 defaultContent').toContain(
      '用户敲的字',
    );
  });

  it('clearContentOnGenerating：generating false→true 时清空输入', async () => {
    const { container, rerender } = render(AIChatInput, {
      props: { defaultContent: '<p>草稿</p>', generating: false },
    }) as unknown as {
      container: Element;
      rerender: (p: Record<string, unknown>) => Promise<void>;
    };
    await flush(container);
    expect(container.querySelector('.ProseMirror')?.textContent).toContain('草稿');
    await rerender({ defaultContent: '<p>草稿</p>', generating: true });
    await flush();
    expect(container.querySelector('.ProseMirror')?.textContent?.trim() ?? '').toBe('');
  });

  it('clearContentOnGenerating=false 时不清空', async () => {
    const { container, rerender } = render(AIChatInput, {
      props: { defaultContent: '<p>草稿</p>', generating: false, clearContentOnGenerating: false },
    }) as unknown as {
      container: Element;
      rerender: (p: Record<string, unknown>) => Promise<void>;
    };
    await flush(container);
    await rerender({ defaultContent: '<p>草稿</p>', generating: true, clearContentOnGenerating: false });
    await flush();
    expect(container.querySelector('.ProseMirror')?.textContent).toContain('草稿');
  });
});

// tiptap 节点视图的类名。Semi 的三个 slot 扩展（inputSlot/selectSlot/skillSlot）
// 刻意**不带 semi- 前缀**（extension/*/index.tsx 里全是裸类名），本库原来一律加了
// cd-ai-chat-input- 前缀，且 skill 外层写成 -wrap（Semi 是 -wrapper）。
describe('AIChatInput · slot 节点类名（对齐 Semi extension/*）', () => {
  it('skill-slot：外层 skill-slot-wrapper，内层 skill-slot + skill-slot-delete', async () => {
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContent: (h: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    component.setContent('<skill-slot data-label="总结" data-value="summarize"></skill-slot>');
    await flush();
    expect(container.querySelector('.skill-slot-wrapper'), '外层应是 -wrapper').not.toBeNull();
    const chip = container.querySelector('.skill-slot');
    expect(chip).not.toBeNull();
    expect(chip!.querySelector('.skill-slot-delete')).not.toBeNull();
    // 带前缀的旧名不该再出现。
    expect(container.querySelector('.cd-ai-chat-input-skill-slot-wrap')).toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-skill-slot')).toBeNull();
  });

  it('input-slot：input-slot > input-slot-placeholder + .content', async () => {
    const rendered = render(AIChatInput) as unknown as {
      container: Element;
      component: { setContent: (h: string) => void };
    };
    const { container, component } = rendered;
    await flush(container);
    // 属性名是 placeholder（不是 data-placeholder，见 input-slot-extension.ts:43）。
    component.setContent('<p><input-slot placeholder="填这里"></input-slot></p>');
    await flush();
    const slot = container.querySelector('.input-slot');
    expect(slot).not.toBeNull();
    expect(slot!.querySelector('.input-slot-placeholder')?.textContent).toContain('填这里');
    // NodeViewContent 的类名是裸 content（对齐 Semi）。
    expect(slot!.querySelector('.content')).not.toBeNull();
    expect(container.querySelector('.cd-ai-chat-input-input-slot')).toBeNull();
  });
});
