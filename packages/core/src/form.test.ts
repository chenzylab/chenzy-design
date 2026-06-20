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

  it('dependencies: changing a dependency re-validates the dependent field', async () => {
    const f = createForm();
    f.registerField('password', { rules: [{ required: true }] });
    f.registerField('confirm', {
      dependencies: ['password'],
      rules: [
        {
          validator: (v, values) =>
            v === values.password ? undefined : 'mismatch',
        },
      ],
    });

    f.setFieldValue('password', 'aaa');
    f.setFieldValue('confirm', 'bbb');
    await f.validateField('confirm');
    expect(f.getFieldError('confirm')).toBe('mismatch');

    // changing password automatically re-validates the dependent confirm (which
    // is "active" because it already shows an error). The error clears once the
    // values match — note we do NOT validate the password field itself here.
    f.setFieldValue('password', 'bbb');
    // allow the scheduled (async) dependent validation to settle
    await Promise.resolve();
    await Promise.resolve();
    expect(f.getFieldError('confirm')).toBeUndefined();
  });

  it('dependencies: untouched/error-free dependent is not eagerly validated', async () => {
    const f = createForm();
    f.registerField('password', {});
    f.registerField('confirm', {
      dependencies: ['password'],
      rules: [{ validator: (v, values) => (v === values.password ? undefined : 'mismatch') }],
    });
    // confirm has neither been touched nor shows an error → must stay clean
    f.setFieldValue('password', 'x', { validate: true });
    await Promise.resolve();
    expect(f.getFieldError('confirm')).toBeUndefined();
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
