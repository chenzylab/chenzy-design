import { describe, expect, it } from 'vitest';
import { resolveCodeClassName } from './code-highlight.js';

describe('resolveCodeClassName', () => {
  it('adds language-<lang> when empty', () => {
    expect(resolveCodeClassName('', 'js', false)).toBe('language-js');
  });

  it('adds line-numbers when lineNumber on', () => {
    expect(resolveCodeClassName('', 'ts', true)).toBe('language-ts line-numbers');
  });

  it('defaults lineNumber to true', () => {
    expect(resolveCodeClassName('', 'css')).toBe('language-css line-numbers');
  });

  it('does not duplicate an existing language class', () => {
    expect(resolveCodeClassName('language-js', 'js', false)).toBe('language-js');
  });

  it('keeps an existing (different) language class and does not add a new one', () => {
    // aligns with Semi: presence of any language-* short-circuits adding
    expect(resolveCodeClassName('language-python', 'js', false)).toBe('language-python');
  });

  it('preserves unrelated existing classes', () => {
    expect(resolveCodeClassName('foo bar', 'js', false)).toBe('foo bar language-js');
  });

  it('removes line-numbers when lineNumber is off', () => {
    expect(resolveCodeClassName('language-js line-numbers', 'js', false)).toBe('language-js');
  });

  it('does not duplicate line-numbers when already present and on', () => {
    expect(resolveCodeClassName('language-js line-numbers', 'js', true)).toBe(
      'language-js line-numbers',
    );
  });

  it('omits language class when language is empty', () => {
    expect(resolveCodeClassName('', '', false)).toBe('');
  });

  it('handles extra whitespace in the incoming className', () => {
    expect(resolveCodeClassName('  foo   ', 'js', false)).toBe('foo language-js');
  });
});
