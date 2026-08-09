// FormErrorMessage 边界行为：对齐 Semi errorMessage.tsx 的两条不渲染规则——
// error === '' 时不渲染（async-validator message:'' 约定：校验失败但隐藏消息）；
// 数组全 falsy（如 InputGroup 场景收集到的空错误集合）时不渲染。
import { describe, it, expect } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import FormErrorMessage from './FormErrorMessage.svelte';

describe('FormErrorMessage', () => {
  it('error 为空字符串时不渲染', () => {
    const { container } = renderWithLocale(FormErrorMessage, { props: { error: '' } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('error 数组全 falsy 时不渲染', () => {
    const { container } = renderWithLocale(FormErrorMessage, { props: { error: [] as string[] } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('error 数组含空字符串项时不渲染', () => {
    const { container } = renderWithLocale(FormErrorMessage, { props: { error: ['', ''] } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('error 数组含真实错误时渲染并 join', () => {
    const { container } = renderWithLocale(FormErrorMessage, {
      props: { error: ['a required', 'b required'] },
    });
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('a required, b required');
  });

  it('error 与 helpText 同传时 error 优先', () => {
    const { container } = renderWithLocale(FormErrorMessage, {
      props: { error: 'bad', helpText: 'hint' },
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('bad');
    expect(container.textContent).not.toContain('hint');
  });

  it('无 error 时展示 helpText（非 alert 容器）', () => {
    const { container } = renderWithLocale(FormErrorMessage, { props: { helpText: 'hint' } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).toContain('hint');
  });
});
