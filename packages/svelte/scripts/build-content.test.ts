/**
 * 净化管线（build-content.ts）的转换规则单测。
 * 约定门禁：docs md / demos.ts 的 authoring 形态漂移必须在这里有反例守护。
 */
import { describe, it, expect } from 'vitest';
import {
  parseFrontmatter,
  parseInlineScript,
  convertNotices,
  generateFallbackMd,
  validateOutput,
} from './build-content.js';

describe('parseFrontmatter', () => {
  it('解析四个标量字段', () => {
    const { fm, body } = parseFrontmatter(
      '---\ntitle: Button 按钮\nname: button\n---\n正文',
    );
    expect(fm.title).toBe('Button 按钮');
    expect(fm.name).toBe('button');
    expect(body).toBe('正文');
  });

  it('无 frontmatter 时 body 为全文', () => {
    const { fm, body } = parseFrontmatter('# 标题');
    expect(fm).toEqual({});
    expect(body).toBe('# 标题');
  });
});

describe('parseInlineScript', () => {
  it('解析成对 demo import 与 $lib import', () => {
    const script = `
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Type from '../../demos/button/01-type.svelte';
  import typeSrc from '../../demos/button/01-type.svelte?raw';
`;
    const { components, sources } = parseInlineScript(script, 'button.md');
    expect(components.get('Type')).toBeTruthy();
    expect(sources.get('typeSrc')).toBe(components.get('Type'));
  });

  it('反例：script 含未知语句报错（约定门禁）', () => {
    expect(() => parseInlineScript(`const x = 1;`, 'x.md')).toThrow(
      /无法识别的语句/,
    );
    expect(() =>
      parseInlineScript(`import { onMount } from 'svelte';`, 'x.md'),
    ).toThrow(/无法识别的语句/);
  });

  it('解析 String.fromCharCode 拼接的字面量常量', () => {
    const script = `const snippetLiteral = String.fromCharCode(123) + '#snippet' + String.fromCharCode(125);`;
    const { literals } = parseInlineScript(script, 'calendar.md');
    expect(literals.get('snippetLiteral')).toBe('{#snippet}');
  });
});

describe('convertNotices', () => {
  it('带 title 的 Notice 转 blockquote', () => {
    const out = convertNotices(
      '<Notice type="primary" title="注意事项">正文一\n正文二</Notice>',
    );
    expect(out).toBe('> **注意事项**\n>\n> 正文一\n> 正文二');
  });

  it('无 title 的 Notice 只引正文', () => {
    const out = convertNotices('<Notice type="warning">仅正文</Notice>');
    expect(out).toBe('> 仅正文');
  });
});

describe('generateFallbackMd', () => {
  it('从 meta 生成含 frontmatter/API 表/宽容 a11y 的文档', () => {
    const md = generateFallbackMd('chat', {
      name: 'Chat',
      category: 'plus',
      description: '对话组件。',
      props: [
        { name: 'chats', type: 'Message[]', desc: '消息列表（含 | 竖线）' },
      ],
      methods: [
        { name: 'scrollToBottom', signature: '() => void', desc: '滚到底' },
      ],
      a11y: { role: 'log', keyboard: '操作按钮 Tab 可达', hasRole: true },
      tokens: ['--cd-chat-bg'],
      examples: [{ title: '基础', code: '<Chat />' }],
    });
    expect(md).toContain('generated: true');
    expect(md).toContain('| chats | 消息列表（含 \\| 竖线） |');
    expect(md).toContain('`scrollToBottom: () => void`');
    expect(md).toContain('- keyboard: 操作按钮 Tab 可达');
    expect(md).not.toContain('[object Object]');
    validateOutput('chat', md); // 产物必须过自校验
  });
});

describe('validateOutput', () => {
  it('代码围栏内的 <script> 不算残留', () => {
    const ok =
      '---\nname: x\n---\n正文\n\n```svelte\n<script>let a=1;</script>\n```\n';
    expect(() => validateOutput('x', ok)).not.toThrow();
  });

  it('反例：围栏外残留 <DemoBox>/<script> 报错', () => {
    expect(() =>
      validateOutput('x', '---\nname: x\n---\n<DemoBox code={a}>'),
    ).toThrow(/残留/);
    expect(() =>
      validateOutput('x', '---\nname: x\n---\n<script>bad</script>'),
    ).toThrow(/残留/);
  });

  it('行内代码提及 `<script>` 不算残留（散文合法引用）', () => {
    const ok = '---\nname: x\n---\n不必先在 `<script>` 里调用工厂函数。';
    expect(() => validateOutput('x', ok)).not.toThrow();
  });

  it('反例：frontmatter name 与文件名不符报错', () => {
    expect(() => validateOutput('button', '---\nname: input\n---\nx')).toThrow(
      /不符/,
    );
  });
});
