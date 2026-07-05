// 阶段 0 · tiptap 技术验证测试（AIChatInput 立项）
// 验证 svelte-tiptap 的 createEditor 在 jsdom + svelte 编译管线下：
//   - 组件挂载不抛错、tiptap 富文本容器（.ProseMirror）渲染；
//   - 初始 content 生效（ProseMirror 渲染出文本）；
//   - onContentChange 回调形态正确（{html,text}）。
// 结论用于 AIChatInput 立项决策（路线可行性）。真实键盘输入/光标交互留浏览器 project。
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import TiptapPoc from './TiptapPoc.svelte';

describe('tiptap POC · 阶段 0 技术验证', () => {
  it('组件挂载不抛错，tiptap 容器渲染', async () => {
    const { container } = render(TiptapPoc, { props: { content: '<p>hello</p>' } });
    expect(container.querySelector('.tiptap-poc')).not.toBeNull();
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('.ProseMirror')).not.toBeNull();
  });

  it('初始 content 生效：ProseMirror 渲染出文本', async () => {
    const { container } = render(TiptapPoc, { props: { content: '<p>initial text</p>' } });
    await new Promise((r) => setTimeout(r, 50));
    const pm = container.querySelector('.ProseMirror');
    expect(pm?.textContent).toContain('initial text');
  });

  it('onContentChange 随 setContent 触发（形态 {html,text}）', async () => {
    const onContentChange = vi.fn();
    const { component } = render(TiptapPoc, {
      props: { content: '<p>a</p>', onContentChange },
    }) as unknown as { component: { setContent: (s: string) => void } };
    await new Promise((r) => setTimeout(r, 50));
    component.setContent('<p>changed</p>');
    await new Promise((r) => setTimeout(r, 20));
    expect(onContentChange).toHaveBeenCalled();
    const lastCall = onContentChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toHaveProperty('html');
    expect(lastCall).toHaveProperty('text');
    expect(lastCall.text).toContain('changed');
  });
});
