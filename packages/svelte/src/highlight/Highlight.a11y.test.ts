// Highlight a11y：命中片段默认渲染 <mark class="cd-highlight-tag">，纯文本输出。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Highlight from './Highlight.svelte';

describe('Highlight a11y', () => {
  it('单关键词：命中渲染 <mark class="cd-highlight-tag">，无 axe violations', async () => {
    const { container } = renderWithLocale(Highlight, {
      props: { sourceString: 'The quick brown fox', searchWords: 'quick' },
    });
    const marks = container.querySelectorAll('mark.cd-highlight-tag');
    expect(marks.length).toBe(1);
    expect(marks[0]?.textContent).toBe('quick');
    await expectNoAxeViolations(container);
  });

  it('多关键词：多处命中，无 axe violations', async () => {
    const { container } = renderWithLocale(Highlight, {
      props: { sourceString: 'red green red blue', searchWords: ['red', 'blue'] },
    });
    const marks = container.querySelectorAll('mark.cd-highlight-tag');
    expect(marks.length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('对象数组差异化样式：每词单独 className/style，无 axe violations', async () => {
    const { container } = renderWithLocale(Highlight, {
      props: {
        sourceString: 'Semi 设计系统',
        searchWords: [
          { text: 'Semi', className: 'k1', style: { color: '#fff', backgroundColor: 'teal' } },
          { text: '设计系统', className: 'k2', style: { padding: 4 } },
        ],
      },
    });
    const k1 = container.querySelector('mark.cd-highlight-tag.k1');
    const k2 = container.querySelector('mark.cd-highlight-tag.k2');
    expect(k1?.textContent).toBe('Semi');
    expect(k2?.textContent).toBe('设计系统');
    // 数字样式值转 px；camelCase 转 kebab
    expect(k1?.getAttribute('style')).toContain('background-color: teal');
    expect(k2?.getAttribute('style')).toContain('padding: 4px');
    await expectNoAxeViolations(container);
  });
});
