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

  it('warningOnly rule produces a warning, not an error, and does not block submit', async () => {
    const f = createForm();
    f.registerField('name', {
      rules: [{ minLength: 5, warningOnly: true, message: 'too short' }],
    });
    f.setFieldValue('name', 'ab');
    const err = await f.validateField('name');
    // warningOnly never surfaces as a blocking error
    expect(err).toBeUndefined();
    expect(f.getFieldError('name')).toBeUndefined();
    expect(f.getFieldWarning('name')).toBe('too short');

    // submit must still be valid despite the standing warning
    const r = await f.submit();
    expect(r.valid).toBe(true);
    expect(f.getFieldWarning('name')).toBe('too short');
  });

  it('warning clears once the warningOnly rule passes', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ minLength: 5, warningOnly: true, message: 'w' }] });
    f.setFieldValue('name', 'ab');
    await f.validateField('name');
    expect(f.getFieldWarning('name')).toBe('w');
    f.setFieldValue('name', 'abcdef');
    await f.validateField('name');
    expect(f.getFieldWarning('name')).toBeUndefined();
  });

  it('a blocking rule still wins even when a warningOnly rule also fails', async () => {
    const f = createForm();
    f.registerField('name', {
      rules: [
        { minLength: 5, warningOnly: true, message: 'warn' },
        { required: true, message: 'err' },
      ],
    });
    f.setFieldValue('name', '');
    const err = await f.validateField('name');
    expect(err).toBe('err');
    expect(f.getFieldError('name')).toBe('err');
    const r = await f.submit();
    expect(r.valid).toBe(false);
  });

  it('validating flag is set during async validation and cleared after', async () => {
    let resolveV: ((v: string | undefined) => void) | undefined;
    const f = createForm();
    f.registerField('u', {
      rules: [{ validator: () => new Promise((r) => (resolveV = r)) }],
    });
    f.setFieldValue('u', 'x');
    const p = f.validateField('u');
    // synchronously after kicking off: the field is marked validating
    expect(f.getState().validating.u).toBe(true);
    resolveV?.(undefined);
    await p;
    expect(f.getState().validating.u).toBe(false);
  });

  it('resetFields clears warnings too', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ minLength: 5, warningOnly: true, message: 'w' }] });
    f.setFieldValue('name', 'ab');
    await f.validateField('name');
    expect(f.getFieldWarning('name')).toBe('w');
    f.resetFields();
    expect(f.getFieldWarning('name')).toBeUndefined();
  });

  // ---- validateTrigger (spec §4 L65 / L84) ----
  it('getFieldTrigger returns the form default when no field override', () => {
    const f = createForm();
    f.registerField('a', {});
    expect(f.getFieldTrigger('a')).toEqual(['blur', 'change']);
  });

  it('getFieldTrigger honors a form-level validateTrigger', () => {
    const f = createForm({ validateTrigger: 'blur' });
    f.registerField('a', {});
    expect(f.getFieldTrigger('a')).toEqual(['blur']);
  });

  it('getFieldTrigger field-level trigger overrides the form default', () => {
    const f = createForm({ validateTrigger: ['blur', 'change'] });
    f.registerField('a', { trigger: 'submit' });
    expect(f.getFieldTrigger('a')).toEqual(['submit']);
  });

  it('getFieldTrigger normalizes a single value to an array', () => {
    const f = createForm({ validateTrigger: 'change' });
    f.registerField('a', {});
    expect(f.getFieldTrigger('a')).toEqual(['change']);
  });

  // ---- stopValidateWithError (spec §4 L68) ----
  it('stopValidateWithError:false (default) runs all rules, surfaces first error', async () => {
    const calls: string[] = [];
    const f = createForm();
    f.registerField('x', {
      rules: [
        { validator: () => (calls.push('r1'), 'first') },
        { validator: () => (calls.push('r2'), 'second') },
      ],
    });
    f.setFieldValue('x', 'v');
    const err = await f.validateField('x');
    expect(err).toBe('first');
    // both rules ran because we did NOT stop at the first error
    expect(calls).toEqual(['r1', 'r2']);
  });

  it('stopValidateWithError:true stops at the first failing rule', async () => {
    const calls: string[] = [];
    const f = createForm({ stopValidateWithError: true });
    f.registerField('x', {
      rules: [
        { validator: () => (calls.push('r1'), 'first') },
        { validator: () => (calls.push('r2'), 'second') },
      ],
    });
    f.setFieldValue('x', 'v');
    const err = await f.validateField('x');
    expect(err).toBe('first');
    // second rule never ran
    expect(calls).toEqual(['r1']);
  });

  it('stopValidateWithError:false still lets a later warningOnly rule surface a warning', async () => {
    const f = createForm();
    f.registerField('x', {
      rules: [
        { required: true, message: 'err' },
        { minLength: 5, warningOnly: true, message: 'warn' },
      ],
    });
    f.setFieldValue('x', '');
    await f.validateField('x');
    expect(f.getFieldError('x')).toBe('err');
    // empty value skips minLength, so no warning here — sanity that error wins
    f.setFieldValue('x', 'ab');
    await f.validateField('x');
    // 'ab' passes required, fails minLength → warning surfaces
    expect(f.getFieldError('x')).toBeUndefined();
    expect(f.getFieldWarning('x')).toBe('warn');
  });

  // ---- allowEmpty (spec §4 L70) ----
  it('allowEmpty:false (default) drops empty-value keys on submit/getFieldsValue', async () => {
    const f = createForm();
    f.registerField('name', {});
    f.registerField('bio', {});
    f.setFieldValue('name', 'jo');
    f.setFieldValue('bio', '');
    expect(f.getFieldsValue()).toEqual({ name: 'jo' });
    const r = await f.submit();
    expect(r.values).toEqual({ name: 'jo' });
  });

  it('allowEmpty:true keeps empty-value keys', async () => {
    const f = createForm({ allowEmpty: true });
    f.registerField('name', {});
    f.registerField('bio', {});
    f.setFieldValue('name', 'jo');
    f.setFieldValue('bio', '');
    expect(f.getFieldsValue()).toEqual({ name: 'jo', bio: '' });
    const r = await f.submit();
    expect(r.values).toEqual({ name: 'jo', bio: '' });
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
