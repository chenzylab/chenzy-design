/**
 * Footer 测试 —— 对齐 Semi datePicker/footer.tsx。
 * cancel(borderless) + confirm(solid，disabledConfirm 禁用)，文案走 locale footer.*。
 */
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Footer from './Footer.svelte';

const PREFIX = 'cd-datepicker';

describe('Footer 对齐 Semi', () => {
  it('渲染 cancel + confirm 两按钮（locale 文案），无 axe violations', async () => {
    const { container } = renderWithLocale(Footer, { props: {} });
    const footer = container.querySelector(`.${PREFIX}-footer`);
    expect(footer).not.toBeNull();
    const btns = footer!.querySelectorAll('button');
    expect(btns.length).toBe(2);
    expect(btns[0]!.textContent).toContain('Cancel');
    expect(btns[1]!.textContent).toContain('Confirm');
    await expectNoAxeViolations(container);
  });

  it('disabledConfirm 时 confirm 按钮禁用', () => {
    const { container } = renderWithLocale(Footer, { props: { disabledConfirm: true } });
    const btns = container.querySelectorAll(`.${PREFIX}-footer button`);
    expect((btns[1] as HTMLButtonElement).disabled).toBe(true);
    expect((btns[0] as HTMLButtonElement).disabled).toBe(false);
  });

  it('点击触发 onCancelClick / onConfirmClick', () => {
    const onCancelClick = vi.fn();
    const onConfirmClick = vi.fn();
    const { container } = renderWithLocale(Footer, { props: { onCancelClick, onConfirmClick } });
    const btns = container.querySelectorAll(`.${PREFIX}-footer button`);
    (btns[0] as HTMLElement).click();
    (btns[1] as HTMLElement).click();
    expect(onCancelClick).toHaveBeenCalledTimes(1);
    expect(onConfirmClick).toHaveBeenCalledTimes(1);
  });
});
