import { describe, expect, it } from 'vitest';
import { createForm } from './form.js';

describe('createForm', () => {
  it('registers fields and reads/writes values', () => {
    const f = createForm({ initialValues: { name: 'a' } });
    f.registerField('name', { label: 'Name' });
    expect(f.getFieldValue('name')).toBe('a');
    f.setFieldValue('name', 'b');
    expect(f.getFieldValue('name')).toBe('b');
  });

  it('required rule fails on empty, passes when filled', async () => {
    const f = createForm();
    f.registerField('email', { label: 'Email', rules: [{ required: true }] });
    expect(await f.validateField('email')).toBeTruthy();
    f.setFieldValue('email', 'x@y.com');
    expect(await f.validateField('email')).toBeUndefined();
  });

  it('email type rule rejects malformed input', async () => {
    const f = createForm();
    f.registerField('email', { rules: [{ type: 'email' }] });
    f.setFieldValue('email', 'nope');
    expect(await f.validateField('email')).toBeTruthy();
    f.setFieldValue('email', 'a@b.co');
    expect(await f.validateField('email')).toBeUndefined();
  });

  it('min/max/length rules', async () => {
    const f = createForm();
    f.registerField('age', { rules: [{ min: 18, max: 60 }] });
    f.setFieldValue('age', 10);
    expect(await f.validateField('age')).toBeTruthy();
    f.setFieldValue('age', 30);
    expect(await f.validateField('age')).toBeUndefined();
  });

  it('async validator latest-wins (race token discard)', async () => {
    let resolveFirst: ((v: string | undefined) => void) | undefined;
    const f = createForm();
    let call = 0;
    f.registerField('u', {
      rules: [
        {
          validator: () => {
            call += 1;
            if (call === 1) return new Promise((r) => (resolveFirst = r));
            return undefined; // second call: valid
          },
        },
      ],
    });
    f.setFieldValue('u', 'first');
    const p1 = f.validateField('u');
    const p2 = f.validateField('u'); // supersedes
    await p2;
    resolveFirst?.('stale error'); // late first result must be discarded
    await p1;
    expect(f.getFieldError('u')).toBeUndefined();
  });

  it('resetFields restores initial values and clears errors', async () => {
    const f = createForm({ initialValues: { name: 'init' } });
    f.registerField('name', { rules: [{ required: true }] });
    f.setFieldValue('name', '');
    await f.validateField('name');
    expect(f.getFieldError('name')).toBeTruthy();
    f.resetFields();
    expect(f.getFieldValue('name')).toBe('init');
    expect(f.getFieldError('name')).toBeUndefined();
  });

  it('submit reports validity and increments submitCount', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ required: true }] });
    const r1 = await f.submit();
    expect(r1.valid).toBe(false);
    expect(f.getState().submitCount).toBe(1);
    f.setFieldValue('name', 'ok');
    const r2 = await f.submit();
    expect(r2.valid).toBe(true);
    expect(r2.values).toEqual({ name: 'ok' });
  });

  it('subscribe notifies on changes', () => {
    const f = createForm();
    f.registerField('x');
    let count = 0;
    const unsub = f.subscribe(() => (count += 1));
    f.setFieldValue('x', 1);
    expect(count).toBeGreaterThan(0);
    unsub();
    const before = count;
    f.setFieldValue('x', 2);
    expect(count).toBe(before);
  });
});
