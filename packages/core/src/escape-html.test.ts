import { describe, it, expect } from 'vitest';
import { escapeHtmlInMarkdown } from './escape-html.js';

describe('escapeHtmlInMarkdown（对齐 Semi escapeHtml）', () => {
  it('转义普通文本里的 <，防止被 Markdown 当 HTML 标签吞掉', () => {
    expect(escapeHtmlInMarkdown('用 <AgentChat /> 组件')).toBe('用 &lt;AgentChat /> 组件');
  });

  it('行内代码内不转义', () => {
    expect(escapeHtmlInMarkdown('看 `<div>` 这个标签')).toBe('看 `<div>` 这个标签');
  });

  it('行内代码外的 < 仍转义，代码内保持原样', () => {
    expect(escapeHtmlInMarkdown('<a> `<b>` <c>')).toBe('&lt;a> `<b>` &lt;c>');
  });

  it('围栏代码块内整块不转义', () => {
    const src = ['前 <x>', '```html', '<div>keep</div>', '```', '后 <y>'].join('\n');
    expect(escapeHtmlInMarkdown(src)).toBe(
      ['前 &lt;x>', '```html', '<div>keep</div>', '```', '后 &lt;y>'].join('\n'),
    );
  });

  it('~~~ 围栏同样生效', () => {
    const src = ['~~~', '<div>keep</div>', '~~~', '<z>'].join('\n');
    expect(escapeHtmlInMarkdown(src)).toBe(['~~~', '<div>keep</div>', '~~~', '&lt;z>'].join('\n'));
  });

  it('反引号数量不配对时按普通文本处理并转义', () => {
    expect(escapeHtmlInMarkdown('``<a>')).toBe('``&lt;a>');
  });

  it('无 < 时原样返回', () => {
    expect(escapeHtmlInMarkdown('纯文本 no angle')).toBe('纯文本 no angle');
  });
});
