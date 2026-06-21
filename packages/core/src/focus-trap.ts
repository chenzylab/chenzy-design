/**
 * useFocusTrap — trap Tab focus within a container, restore on release.
 * Used by overlays (Modal/Drawer/Dropdown). See specs/00-foundation/a11y.spec.md.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface FocusTrap {
  activate(): void;
  deactivate(): void;
}

export interface FocusTrapOptions {
  /**
   * 是否捕获 Tab/Shift+Tab 做焦点循环。false 时仍执行进场聚焦与归还焦点，
   * 但不拦截键盘 Tab（供 keyboard 总开关关闭键盘交互时使用）。默认 true。
   */
  trapTab?: boolean;
}

export function useFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {},
): FocusTrap {
  const { trapTab = true } = options;
  let previouslyFocused: HTMLElement | null = null;

  function getFocusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const items = getFocusable();
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      previouslyFocused = document.activeElement as HTMLElement | null;
      if (trapTab) container.addEventListener('keydown', onKeydown);
      getFocusable()[0]?.focus();
    },
    deactivate() {
      if (trapTab) container.removeEventListener('keydown', onKeydown);
      previouslyFocused?.focus();
      previouslyFocused = null;
    },
  };
}
