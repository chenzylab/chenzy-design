/**
 * createEditable — framework-agnostic inline-edit state machine for Typography.
 *
 * State: idle | editing. Manages a draft value, commit/cancel transitions and
 * the keyboard contract (Enter commits, Shift+Enter inserts a newline, Esc
 * cancels). Pure logic + small imperative key/value helpers — no DOM, no
 * framework reactivity. The render layer owns the <textarea>, focus moves and
 * the controlled `value` (red line #1: editable does NOT write back; it only
 * surfaces the draft via onChange on commit).
 *
 * See specs/components/basic/Typography.spec.md §3, §4.3, §11.
 */

/** clamp a draft to maxLength (in code units); undefined/0-or-less = no limit. */
export function clampLength(value: string, maxLength?: number): string {
  if (maxLength === undefined || maxLength <= 0) return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

export type EditableTrigger = 'click' | 'dblclick' | 'icon';

export interface EditableKeyEvent {
  key: string;
  shiftKey?: boolean;
}

/** What a keydown should do while editing. */
export type EditableKeyAction = 'confirm' | 'cancel' | 'newline' | 'none';

/** Pure: map a keydown (while editing) to its semantic action. */
export function resolveEditableKey(e: EditableKeyEvent): EditableKeyAction {
  if (e.key === 'Escape') return 'cancel';
  if (e.key === 'Enter') return e.shiftKey ? 'newline' : 'confirm';
  return 'none';
}

export interface EditableOptions {
  /** initial / source value (controlled by the render layer) */
  value?: string;
  /** character cap applied to the draft */
  maxLength?: number;
  /** how editing is entered (informational; render layer wires the trigger) */
  trigger?: EditableTrigger;
  /** re-render hook fired whenever editing/draft changes */
  onChange?: (state: EditableSnapshot) => void;
  /** fired on commit with the final (clamped) draft value */
  onCommit?: (value: string) => void;
  /** fired when entering edit mode */
  onStart?: () => void;
  /** fired when editing is cancelled */
  onCancel?: () => void;
}

export interface EditableSnapshot {
  editing: boolean;
  draft: string;
}

export interface EditableApi {
  readonly editing: boolean;
  readonly draft: string;
  /** enter edit mode, seeding the draft from `source` (or the configured value) */
  start(source?: string): void;
  /** update the draft (auto-clamped to maxLength) */
  setDraft(next: string): void;
  /** commit the current draft: leave edit mode + fire onCommit when changed */
  confirm(): void;
  /** discard the draft, leave edit mode, fire onCancel */
  cancel(): void;
  /** handle a keydown while editing; returns the action taken */
  handleKey(e: EditableKeyEvent): EditableKeyAction;
}

export function createEditable(options: EditableOptions = {}): EditableApi {
  let editing = false;
  let draft = options.value ?? '';

  function emit(): void {
    options.onChange?.({ editing, draft });
  }

  return {
    get editing() {
      return editing;
    },
    get draft() {
      return draft;
    },
    start(source) {
      if (editing) return;
      editing = true;
      draft = clampLength(source ?? options.value ?? '', options.maxLength);
      options.onStart?.();
      emit();
    },
    setDraft(next) {
      const clamped = clampLength(next, options.maxLength);
      if (clamped === draft) return;
      draft = clamped;
      emit();
    },
    confirm() {
      if (!editing) return;
      editing = false;
      const committed = draft;
      // red line #1: surface via callback only; never self-mutate `value`.
      if (committed !== (options.value ?? '')) {
        options.onCommit?.(committed);
      }
      emit();
    },
    cancel() {
      if (!editing) return;
      editing = false;
      draft = options.value ?? '';
      options.onCancel?.();
      emit();
    },
    handleKey(e) {
      const action = resolveEditableKey(e);
      if (action === 'confirm') this.confirm();
      else if (action === 'cancel') this.cancel();
      // 'newline' / 'none' are left to the textarea's native behavior
      return action;
    },
  };
}
