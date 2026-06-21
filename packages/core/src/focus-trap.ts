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
  /**
   * deactivate 时是否把焦点归还给激活前聚焦的元素。默认 true。
   * 设 false 时不归还焦点（供 Popover returnFocus=false 等场景）。
   */
  returnFocus?: boolean;
  /**
   * 是否记忆 deactivate 时浮层内最后聚焦的元素，下次 activate 优先恢复到它
   * （而非聚焦首个可聚焦元素）。默认 false。供 Popover rememberFocus 复用。
   * 仅当被记忆的元素在重新 activate 时仍可聚焦才恢复，否则退回首个。
   */
  rememberFocus?: boolean;
}

export function useFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {},
): FocusTrap {
  const { trapTab = true, returnFocus = true, rememberFocus = false } = options;
  let previouslyFocused: HTMLElement | null = null;
  // rememberFocus：deactivate 时记下浮层内最后聚焦的元素，下次 activate 恢复。
  let lastInnerFocused: HTMLElement | null = null;

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
      // rememberFocus：若记忆的元素仍在容器内且可聚焦，恢复到它；否则聚焦首个。
      if (
        rememberFocus &&
        lastInnerFocused &&
        container.contains(lastInnerFocused) &&
        lastInnerFocused.offsetParent !== null
      ) {
        lastInnerFocused.focus();
      } else {
        getFocusable()[0]?.focus();
      }
    },
    deactivate() {
      if (trapTab) container.removeEventListener('keydown', onKeydown);
      // rememberFocus：归还焦点前记下浮层内当前焦点，供下次 activate 恢复。
      if (rememberFocus) {
        const active = document.activeElement as HTMLElement | null;
        lastInnerFocused = active && container.contains(active) ? active : null;
      }
      if (returnFocus) previouslyFocused?.focus();
      previouslyFocused = null;
    },
  };
}
