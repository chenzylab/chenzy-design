// Highlight a11y：命中片段默认渲染 <mark>，纯文本输出。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Highlight from './Highlight.svelte';

describe('Highlight a11y', () => {
  it('单关键词：命中渲染 <mark>，无 axe violations', async () => {
    const { container } = renderWithLocale(Highlight, {
      props: { sourceString: 'The quick brown fox', searchWords: 'quick' },
    });
    const marks = container.querySelectorAll('mark.cd-highlight__mark');
    expect(marks.length).toBe(1);
    expect(marks[0]?.textContent).toBe('quick');
    await expectNoAxeViolations(container);
  });

  it('多关键词：多处命中，无 axe violations', async () => {
    const { container } = renderWithLocale(Highlight, {
      props: { sourceString: 'red green red blue', searchWords: ['red', 'blue'] },
    });
    const marks = container.querySelectorAll('mark.cd-highlight__mark');
    expect(marks.length).toBe(3);
    await expectNoAxeViolations(container);
  });
});
