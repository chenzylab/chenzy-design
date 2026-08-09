// ArrayField 行为测试：经 ArrayFieldA11yFixture 验证 keepState 在 Form.ArrayField
// 内被强制忽略并警告（行路径随 remove/move 偏移，按路径恢复语义不再成立），
// 以及 useArrayFieldState() 在 ArrayField 后代正确读到 inArrayField=true。
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import ArrayFieldA11yFixture from './ArrayFieldA11yFixture.svelte';

describe('Form.ArrayField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keepState 在 ArrayField 内被忽略并打印警告', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithLocale(ArrayFieldA11yFixture, {});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('keepState is ignored'));
  });

  it('useArrayFieldState() 在 ArrayField 后代读到 inArrayField=true', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = renderWithLocale(ArrayFieldA11yFixture, {});
    const panel = container.querySelector('[data-testid="in-array-field"]');
    expect(panel?.textContent).toBe('true');
  });
});
