/**
 * createCopyable — framework-agnostic clipboard-copy state machine for Typography.
 *
 * Pure logic + a thin imperative clipboard bridge:
 * - copy(content?) writes to the clipboard (navigator.clipboard.writeText with a
 *   document.execCommand('copy') fallback for non-secure contexts / older browsers).
 * - manages a transient `copied` flag that auto-resets after `resetDelay` ms.
 * - notifies the render layer via onChange (so it can re-render) and fires
 *   onCopy(content) / onError(error) callbacks. The render layer owns the live
 *   region announce + DOM; this module never touches the DOM beyond clipboard.
 *
 * No framework deps, no $state. The svelte layer wraps the snapshot in $state.
 * See specs/components/basic/Typography.spec.md §3, §11.
 */

export interface CopyableOptions {
  /** default content to copy when copy() is called without an argument */
  content?: string;
  /** ms before the `copied` flag auto-resets (default 3000) */
  resetDelay?: number;
  /** called whenever copied flips, so the render layer can re-read state */
  onChange?: (copied: boolean) => void;
  /** called after a successful copy with the copied content */
  onCopy?: (content: string) => void;
  /** called when both clipboard strategies fail */
  onError?: (error: unknown) => void;
}

export interface CopyableApi {
  /** whether the success state is currently shown */
  readonly copied: boolean;
  /**
   * Copy `content` (or the configured default) to the clipboard.
   * Resolves true on success, false on failure. Never throws.
   */
  copy(content?: string): Promise<boolean>;
  /** immediately clear the copied flag + cancel the pending reset timer */
  reset(): void;
  /** cancel timers; call on unmount */
  destroy(): void;
}

/** Imperative clipboard write with execCommand fallback. Returns success. */
export async function writeClipboard(text: string): Promise<boolean> {
  // Primary: async Clipboard API (requires secure context + permission).
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }

  // Fallback: hidden textarea + execCommand('copy').
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    // keep it out of the viewport + non-interactive so focus is restored cleanly
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    const active = document.activeElement as HTMLElement | null;
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    // restore focus to whatever had it before
    active?.focus?.();
    return ok;
  } catch {
    return false;
  }
}

export function createCopyable(options: CopyableOptions = {}): CopyableApi {
  const resetDelay = options.resetDelay ?? 3000;
  let copied = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clearTimer(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  function setCopied(next: boolean): void {
    if (copied === next) return;
    copied = next;
    options.onChange?.(copied);
  }

  return {
    get copied() {
      return copied;
    },
    async copy(content) {
      const text = content ?? options.content ?? '';
      const ok = await writeClipboard(text);
      if (!ok) {
        options.onError?.(new Error('copy failed'));
        return false;
      }
      clearTimer();
      setCopied(true);
      options.onCopy?.(text);
      if (resetDelay > 0 && resetDelay !== Number.POSITIVE_INFINITY) {
        timer = setTimeout(() => {
          timer = undefined;
          setCopied(false);
        }, resetDelay);
      }
      return true;
    },
    reset() {
      clearTimer();
      setCopied(false);
    },
    destroy() {
      clearTimer();
    },
  };
}
