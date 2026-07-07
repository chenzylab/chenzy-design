import { describe, it, expect, vi } from 'vitest';
import { createEditable, clampLength, isOverLimit, resolveEditableKey } from './editable.js';

describe('clampLength', () => {
  it('returns value unchanged when no maxLength', () => {
    expect(clampLength('hello')).toBe('hello');
  });
  it('truncates to maxLength', () => {
    expect(clampLength('hello', 3)).toBe('hel');
  });
  it('ignores maxLength <= 0', () => {
    expect(clampLength('hello', 0)).toBe('hello');
  });
});

describe('isOverLimit', () => {
  it('false when no maxLength', () => {
    expect(isOverLimit('hello')).toBe(false);
  });
  it('false when within limit', () => {
    expect(isOverLimit('hel', 3)).toBe(false);
  });
  it('false at exactly the limit', () => {
    expect(isOverLimit('hel', 3)).toBe(false);
  });
  it('true when over the limit', () => {
    expect(isOverLimit('hello', 3)).toBe(true);
  });
  it('false when maxLength <= 0', () => {
    expect(isOverLimit('hello', 0)).toBe(false);
  });
});

describe('resolveEditableKey', () => {
  it('Enter → confirm', () => {
    expect(resolveEditableKey({ key: 'Enter' })).toBe('confirm');
  });
  it('Shift+Enter → newline', () => {
    expect(resolveEditableKey({ key: 'Enter', shiftKey: true })).toBe('newline');
  });
  it('Escape → cancel', () => {
    expect(resolveEditableKey({ key: 'Escape' })).toBe('cancel');
  });
  it('other → none', () => {
    expect(resolveEditableKey({ key: 'a' })).toBe('none');
  });
});

describe('createEditable', () => {
  it('start enters editing and seeds draft from value', () => {
    const e = createEditable({ value: 'orig' });
    e.start();
    expect(e.editing).toBe(true);
    expect(e.draft).toBe('orig');
  });

  it('start(source) seeds from explicit source', () => {
    const e = createEditable({ value: 'orig' });
    e.start('other');
    expect(e.draft).toBe('other');
  });

  it('setDraft hard-clamps to maxLength (chars past the cap are dropped)', () => {
    const e = createEditable({ value: '', maxLength: 3 });
    e.start();
    e.setDraft('abcdef');
    expect(e.draft).toBe('abc');
    expect(e.overLimit).toBe(false);
  });

  it('overLimit stays false since draft is always clamped', () => {
    const e = createEditable({ value: '', maxLength: 3 });
    e.start();
    e.setDraft('abc');
    expect(e.overLimit).toBe(false);
  });

  it('confirm commits the clamped draft', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', maxLength: 3, onCommit });
    e.start();
    e.setDraft('abcdef');
    e.confirm();
    expect(e.editing).toBe(false);
    expect(onCommit).toHaveBeenCalledWith('abc');
  });

  it('handleKey Enter confirms the clamped draft', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', maxLength: 3, onCommit });
    e.start();
    e.setDraft('abcdef');
    const action = e.handleKey({ key: 'Enter' });
    expect(action).toBe('confirm');
    expect(e.editing).toBe(false);
    expect(onCommit).toHaveBeenCalledWith('abc');
  });

  it('start clamps an over-limit source to maxLength', () => {
    const e = createEditable({ value: 'abcdef', maxLength: 3 });
    e.start();
    expect(e.draft).toBe('abc');
    expect(e.overLimit).toBe(false);
  });

  it('accepts text / both triggers (informational)', () => {
    expect(() => createEditable({ trigger: 'text' })).not.toThrow();
    expect(() => createEditable({ trigger: 'both' })).not.toThrow();
  });

  it('confirm fires onCommit only when changed and exits editing', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', onCommit });
    e.start();
    e.setDraft('b');
    e.confirm();
    expect(e.editing).toBe(false);
    expect(onCommit).toHaveBeenCalledWith('b');
  });

  it('confirm does not fire onCommit when unchanged', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', onCommit });
    e.start();
    e.confirm();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('cancel restores value and fires onCancel', () => {
    const onCancel = vi.fn();
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', onCancel, onCommit });
    e.start();
    e.setDraft('changed');
    e.cancel();
    expect(e.editing).toBe(false);
    expect(e.draft).toBe('a');
    expect(onCancel).toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('handleKey Enter confirms', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', onCommit });
    e.start();
    e.setDraft('b');
    const action = e.handleKey({ key: 'Enter' });
    expect(action).toBe('confirm');
    expect(onCommit).toHaveBeenCalledWith('b');
  });

  it('handleKey Esc cancels', () => {
    const e = createEditable({ value: 'a' });
    e.start();
    e.setDraft('b');
    const action = e.handleKey({ key: 'Escape' });
    expect(action).toBe('cancel');
    expect(e.editing).toBe(false);
    expect(e.draft).toBe('a');
  });

  it('handleKey Shift+Enter is newline (no confirm)', () => {
    const onCommit = vi.fn();
    const e = createEditable({ value: 'a', onCommit });
    e.start();
    const action = e.handleKey({ key: 'Enter', shiftKey: true });
    expect(action).toBe('newline');
    expect(e.editing).toBe(true);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not write back value (red line #1)', () => {
    const opts = { value: 'a', onCommit: vi.fn() };
    const e = createEditable(opts);
    e.start();
    e.setDraft('b');
    e.confirm();
    // options.value untouched; only callback surfaced the new value
    expect(opts.value).toBe('a');
  });
});
