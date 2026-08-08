// Typography a11y：Text→<span>、Title→<hN>、Link→<a>。
// 经 TypographyA11yFixture 提供真实文本 children（自带 LocaleProvider，故直接 render）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { expectNoAxeViolations } from '../test-utils/a11y.js';
import TypographyA11yFixture from './TypographyA11yFixture.svelte';

describe('Typography a11y', () => {
  it('Text：渲染文本，无 axe violations', async () => {
    const { container } = render(TypographyA11yFixture, {
      props: { variant: 'text', text: 'Body text' },
    });
    expect(container.textContent).toContain('Body text');
    await expectNoAxeViolations(container);
  });

  it('Title：渲染为 heading 元素，无 axe violations', async () => {
    const { container } = render(TypographyA11yFixture, {
      props: { variant: 'title', text: 'Section title', props: { heading: 2 } },
    });
    expect(container.querySelector('h2')?.textContent).toContain('Section title');
    await expectNoAxeViolations(container);
  });

  it('Link：渲染 <a> 带 href 且有可访问名，无 axe violations', async () => {
    const { container } = render(TypographyA11yFixture, {
      props: { variant: 'link', text: 'Visit', props: { href: 'https://example.com' } },
    });
    const a = container.querySelector('a');
    expect(a?.getAttribute('href')).toBe('https://example.com');
    expect(a?.textContent).toContain('Visit');
    await expectNoAxeViolations(container);
  });

  it('Link：宿主恒为 span 且带 -link class，<a> 由装饰链在内容层单独包裹、自身无业务 class（对齐 Semi wrapperDecorations wrap(link, disabled?"span":"a") 施加于 children 而非容器）', () => {
    const { container } = render(TypographyA11yFixture, {
      props: { variant: 'link', text: 'Visit', props: { href: 'https://example.com' } },
    });
    const host = container.querySelector('span.cd-typography')!;
    expect(host.classList.contains('cd-typography-link')).toBe(true);
    const a = container.querySelector('a')!;
    expect(a.parentElement).toBe(host);
    expect(a.classList.contains('cd-typography')).toBe(false);
    expect(a.classList.contains('cd-typography-link')).toBe(false);
  });

  it('Link + disabled：宿主退回不可点击的 span（对齐 Semi wrap(link, disabled?"span":"a")）', () => {
    const { container } = render(TypographyA11yFixture, {
      props: {
        variant: 'link',
        text: 'Visit',
        props: { href: 'https://example.com', disabled: true },
      },
    });
    expect(container.querySelector('a')).toBeNull();
    const span = container.querySelector('.cd-typography-link');
    expect(span?.tagName).toBe('SPAN');
  });
});
