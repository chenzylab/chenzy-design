import { describe, expect, it } from 'vitest';
import { createForm } from './form.js';

describe('createForm', () => {
  it('registers fields and reads/writes values', () => {
    const f = createForm({ initialValues: { name: 'a' } });
    f.registerField('name', { label: 'Name' });
    expect(f.getValue('name')).toBe('a');
    f.setValue('name', 'b');
    expect(f.getValue('name')).toBe('b');
  });

  it('required rule fails on empty, passes when filled', async () => {
    const f = createForm();
    f.registerField('email', { label: 'Email', rules: [{ required: true }] });
    expect(await f.validateField('email')).toBeTruthy();
    f.setValue('email', 'x@y.com');
    expect(await f.validateField('email')).toBeUndefined();
  });

  it('email type rule rejects malformed input', async () => {
    const f = createForm();
    f.registerField('email', { rules: [{ type: 'email' }] });
    f.setValue('email', 'nope');
    expect(await f.validateField('email')).toBeTruthy();
    f.setValue('email', 'a@b.co');
    expect(await f.validateField('email')).toBeUndefined();
  });

  it('min/max/length rules', async () => {
    const f = createForm();
    f.registerField('age', { rules: [{ min: 18, max: 60 }] });
    f.setValue('age', 10);
    expect(await f.validateField('age')).toBeTruthy();
    f.setValue('age', 30);
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
    f.setValue('u', 'first');
    const p1 = f.validateField('u');
    const p2 = f.validateField('u'); // supersedes
    await p2;
    resolveFirst?.('stale error'); // late first result must be discarded
    await p1;
    expect(f.getError('u')).toBeUndefined();
  });

  it('reset restores initial values and clears errors', async () => {
    const f = createForm({ initialValues: { name: 'init' } });
    f.registerField('name', { rules: [{ required: true }] });
    f.setValue('name', '');
    await f.validateField('name');
    expect(f.getError('name')).toBeTruthy();
    f.reset();
    expect(f.getValue('name')).toBe('init');
    expect(f.getError('name')).toBeUndefined();
  });

  it('submit reports validity and increments submitCount', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ required: true }] });
    const r1 = await f.submitForm();
    expect(r1.valid).toBe(false);
    expect(f.getFormState().submitCount).toBe(1);
    f.setValue('name', 'ok');
    const r2 = await f.submitForm();
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

    f.setValue('password', 'aaa');
    f.setValue('confirm', 'bbb');
    await f.validateField('confirm');
    expect(f.getError('confirm')).toBe('mismatch');

    // changing password automatically re-validates the dependent confirm (which
    // is "active" because it already shows an error). The error clears once the
    // values match — note we do NOT validate the password field itself here.
    f.setValue('password', 'bbb');
    // allow the scheduled (async) dependent validation to settle. The engine now
    // runs through async-validator (Promise-based), so it needs a real task tick
    // rather than a couple of microtasks.
    await new Promise((r) => setTimeout(r, 0));
    expect(f.getError('confirm')).toBeUndefined();
  });

  it('dependencies: untouched/error-free dependent is not eagerly validated', async () => {
    const f = createForm();
    f.registerField('password', {});
    f.registerField('confirm', {
      dependencies: ['password'],
      rules: [{ validator: (v, values) => (v === values.password ? undefined : 'mismatch') }],
    });
    // confirm has neither been touched nor shows an error → must stay clean
    f.setValue('password', 'x', { validate: true });
    await Promise.resolve();
    expect(f.getError('confirm')).toBeUndefined();
  });

  it('warningOnly rule produces a warning, not an error, and does not block submit', async () => {
    const f = createForm();
    f.registerField('name', {
      rules: [{ minLength: 5, warningOnly: true, message: 'too short' }],
    });
    f.setValue('name', 'ab');
    const err = await f.validateField('name');
    // warningOnly never surfaces as a blocking error
    expect(err).toBeUndefined();
    expect(f.getError('name')).toBeUndefined();
    expect(f.getFieldWarning('name')).toBe('too short');

    // submit must still be valid despite the standing warning
    const r = await f.submitForm();
    expect(r.valid).toBe(true);
    expect(f.getFieldWarning('name')).toBe('too short');
  });

  it('warning clears once the warningOnly rule passes', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ minLength: 5, warningOnly: true, message: 'w' }] });
    f.setValue('name', 'ab');
    await f.validateField('name');
    expect(f.getFieldWarning('name')).toBe('w');
    f.setValue('name', 'abcdef');
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
    f.setValue('name', '');
    const err = await f.validateField('name');
    expect(err).toBe('err');
    expect(f.getError('name')).toBe('err');
    const r = await f.submitForm();
    expect(r.valid).toBe(false);
  });

  it('validating flag is set during async validation and cleared after', async () => {
    let resolveV: ((v: string | undefined) => void) | undefined;
    const f = createForm();
    f.registerField('u', {
      rules: [{ validator: () => new Promise((r) => (resolveV = r)) }],
    });
    f.setValue('u', 'x');
    const p = f.validateField('u');
    // synchronously after kicking off: the field is marked validating
    expect(f.getFormState().validating.u).toBe(true);
    resolveV?.(undefined);
    await p;
    expect(f.getFormState().validating.u).toBe(false);
  });

  it('reset clears warnings too', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ minLength: 5, warningOnly: true, message: 'w' }] });
    f.setValue('name', 'ab');
    await f.validateField('name');
    expect(f.getFieldWarning('name')).toBe('w');
    f.reset();
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
    f.setValue('x', 'v');
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
    f.setValue('x', 'v');
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
    f.setValue('x', '');
    await f.validateField('x');
    expect(f.getError('x')).toBe('err');
    // empty value skips minLength, so no warning here — sanity that error wins
    f.setValue('x', 'ab');
    await f.validateField('x');
    // 'ab' passes required, fails minLength → warning surfaces
    expect(f.getError('x')).toBeUndefined();
    expect(f.getFieldWarning('x')).toBe('warn');
  });

  // ---- allowEmpty (spec §4 L70) ----
  it('allowEmpty:false (default) drops empty-value keys on submit/getValues', async () => {
    const f = createForm();
    f.registerField('name', {});
    f.registerField('bio', {});
    f.setValue('name', 'jo');
    f.setValue('bio', '');
    expect(f.getValues()).toEqual({ name: 'jo' });
    const r = await f.submitForm();
    expect(r.values).toEqual({ name: 'jo' });
  });

  it('allowEmpty:true keeps empty-value keys', async () => {
    const f = createForm({ allowEmpty: true });
    f.registerField('name', {});
    f.registerField('bio', {});
    f.setValue('name', 'jo');
    f.setValue('bio', '');
    expect(f.getValues()).toEqual({ name: 'jo', bio: '' });
    const r = await f.submitForm();
    expect(r.values).toEqual({ name: 'jo', bio: '' });
  });

  // ---- field-level initialValue (spec §4.2 L79) ----
  it('registerField initialValue seeds the field value (field-level init)', () => {
    const f = createForm();
    f.registerField('plan', { initialValue: 'pro' });
    expect(f.getValue('plan')).toBe('pro');
    expect(f.getValues()).toEqual({ plan: 'pro' });
  });

  it('container initialValues take precedence over field initialValue', () => {
    const f = createForm({ initialValues: { plan: 'team' } });
    f.registerField('plan', { initialValue: 'pro' });
    // container already supplied a value → field init does not clobber it
    expect(f.getValue('plan')).toBe('team');
  });

  it('reset restores the field-level initialValue', () => {
    const f = createForm();
    f.registerField('plan', { initialValue: 'pro' });
    f.setValue('plan', 'free');
    expect(f.getValue('plan')).toBe('free');
    f.reset();
    expect(f.getValue('plan')).toBe('pro');
  });

  // ---- field-level transform (spec §4.2 L88) ----
  it('transform converts the value on collect/submit without mutating state', async () => {
    const f = createForm();
    f.registerField('tags', { transform: (v) => String(v).split(',').map((s) => s.trim()) });
    f.setValue('tags', 'a, b , c');
    // live state keeps the raw string (red line #2: pure transform, no write-back)
    expect(f.getValue('tags')).toBe('a, b , c');
    expect(f.getValues()).toEqual({ tags: ['a', 'b', 'c'] });
    const r = await f.submitForm();
    expect(r.values).toEqual({ tags: ['a', 'b', 'c'] });
  });

  it('transform receives sibling values and runs over emptiable input', async () => {
    const f = createForm({ allowEmpty: true });
    f.registerField('a', {});
    f.registerField('full', { transform: (_v, values) => `${values.a as string}!` });
    f.setValue('a', 'hi');
    f.setValue('full', '');
    expect(f.getValues()).toEqual({ a: 'hi', full: 'hi!' });
  });

  it('subscribe notifies on changes', () => {
    const f = createForm();
    f.registerField('x');
    let count = 0;
    const unsub = f.subscribe(() => (count += 1));
    f.setValue('x', 1);
    expect(count).toBeGreaterThan(0);
    unsub();
    const before = count;
    f.setValue('x', 2);
    expect(count).toBe(before);
  });

  // ---- Semi bare-name additions (批C-A) ----
  it('getValue() with no arg returns a snapshot of all values', () => {
    const f = createForm({ initialValues: { a: 1, b: 2 } });
    expect(f.getValue()).toEqual({ a: 1, b: 2 });
    // snapshot is a copy — mutating it must not affect form state
    (f.getValue() as Record<string, unknown>).a = 99;
    expect(f.getValue('a')).toBe(1);
  });

  it('getError() with no arg returns the whole errors map', async () => {
    const f = createForm();
    f.registerField('name', { rules: [{ required: true }] });
    await f.validateField('name');
    expect(f.getError()).toEqual(f.getFormState().errors);
    expect(f.getError('name')).toBeTruthy();
  });

  it('setError imperatively sets a field error', () => {
    const f = createForm();
    f.registerField('name', {});
    f.setError('name', 'server says no');
    expect(f.getError('name')).toBe('server says no');
    f.setError('name', undefined);
    expect(f.getError('name')).toBeUndefined();
  });

  it('getFieldExist reflects registration and cleanup', () => {
    const f = createForm();
    expect(f.getFieldExist('name')).toBe(false);
    const unregister = f.registerField('name', {});
    expect(f.getFieldExist('name')).toBe(true);
    unregister();
    expect(f.getFieldExist('name')).toBe(false);
  });

  it('getInitValue / getInitValues expose initial values', () => {
    const f = createForm({ initialValues: { a: 1 } });
    f.registerField('b', { initialValue: 2 });
    expect(f.getInitValue('a')).toBe(1);
    expect(f.getInitValue('b')).toBe(2);
    expect(f.getInitValue('missing')).toBeUndefined();
    expect(f.getInitValue()).toEqual({ a: 1, b: 2 });
    expect(f.getInitValues()).toEqual({ a: 1, b: 2 });
    // changing a live value must not affect the init snapshot
    f.setValue('a', 9);
    expect(f.getInitValue('a')).toBe(1);
  });

  it('reset(fields) resets only the targeted fields', async () => {
    const f = createForm({ initialValues: { a: 'a0', b: 'b0' } });
    f.registerField('a', { rules: [{ required: true }] });
    f.registerField('b', { rules: [{ required: true }] });
    f.setValue('a', '');
    f.setValue('b', '');
    await f.validate();
    expect(f.getError('a')).toBeTruthy();
    expect(f.getError('b')).toBeTruthy();

    f.reset(['a']);
    // only `a` fell back to its initial value and lost its error
    expect(f.getValue('a')).toBe('a0');
    expect(f.getError('a')).toBeUndefined();
    // `b` is untouched by the partial reset
    expect(f.getValue('b')).toBe('');
    expect(f.getError('b')).toBeTruthy();
  });

  it('reset(fields) drops a field that has no initial value', () => {
    const f = createForm();
    f.registerField('a', {});
    f.setValue('a', 'x');
    f.reset(['a']);
    expect(f.getValue('a')).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(f.getValue() as object, 'a')).toBe(false);
  });

  it('setValues merges by default, replaces with isOverride', () => {
    const f = createForm({ initialValues: { a: 1, b: 2 } });
    f.setValues({ b: 20 });
    expect(f.getValue()).toEqual({ a: 1, b: 20 });
    f.setValues({ c: 3 }, { isOverride: true });
    expect(f.getValue()).toEqual({ c: 3 });
  });

  // ---- 批C-E: real nested-array paths (lodash path, Semi-aligned) ----
  it('getValue/setValue address nested array paths (users[0].name)', () => {
    const f = createForm();
    f.setValue('users[0].name', 'ada');
    f.setValue('users[0].age', 30);
    f.setValue('users[1].name', 'bob');
    // reads resolve nested paths
    expect(f.getValue('users[0].name')).toBe('ada');
    expect(f.getValue('users[1].name')).toBe('bob');
    // the underlying tree is a REAL array of objects, not flat keys
    expect(f.getValue('users')).toEqual([
      { name: 'ada', age: 30 },
      { name: 'bob' },
    ]);
    // no flat string keys leaked
    const all = f.getValue() as Record<string, unknown>;
    expect(Object.keys(all)).toEqual(['users']);
    expect(Array.isArray((all as { users: unknown }).users)).toBe(true);
  });

  it('setValue does not mutate the previous values tree (immutable)', () => {
    const f = createForm();
    f.setValue('a.b', 1);
    const before = f.getFormState().values;
    f.setValue('a.c', 2);
    const after = f.getFormState().values;
    // fresh root reference so Svelte subscribers see the change
    expect(after).not.toBe(before);
    expect(f.getValue('a')).toEqual({ b: 1, c: 2 });
  });

  it('collectValues rebuilds a nested array structure from registered fields', () => {
    const f = createForm();
    f.registerField('users[0].name', {});
    f.registerField('users[0].age', {});
    f.registerField('users[1].name', {});
    f.setValue('users[0].name', 'ada');
    f.setValue('users[0].age', 42);
    f.setValue('users[1].name', 'bob');
    // getValues returns a real nested array — the core Semi-alignment point
    expect(f.getValues()).toEqual({
      users: [
        { name: 'ada', age: 42 },
        { name: 'bob' },
      ],
    });
  });

  it('nested-path field validates and reads value by path', async () => {
    const f = createForm();
    f.registerField('users[0].name', { label: 'Name', rules: [{ required: true }] });
    expect(await f.validateField('users[0].name')).toBeTruthy();
    f.setValue('users[0].name', 'ada');
    expect(await f.validateField('users[0].name')).toBeUndefined();
  });

  it('nested initialValues seed nested reads and reset restores them', () => {
    const f = createForm({ initialValues: { users: [{ name: 'seed' }] } });
    expect(f.getValue('users[0].name')).toBe('seed');
    f.setValue('users[0].name', 'changed');
    expect(f.getValue('users[0].name')).toBe('changed');
    f.reset();
    expect(f.getValue('users[0].name')).toBe('seed');
    // initial snapshot never aliased the mutated live tree
    expect(f.getInitValue('users[0].name')).toBe('seed');
  });

  // ---- 批C-E: async-validator-specific rules ----
  it('type=array rule (async-validator) rejects non-arrays', async () => {
    const f = createForm();
    f.registerField('tags', { rules: [{ type: 'array', message: 'must be array' }] });
    f.setValue('tags', 'nope');
    expect(await f.validateField('tags')).toBe('must be array');
    f.setValue('tags', ['a', 'b']);
    expect(await f.validateField('tags')).toBeUndefined();
  });

  it('type=enum rule (async-validator) restricts to allowed values', async () => {
    const f = createForm();
    f.registerField('plan', {
      rules: [{ type: 'enum', enum: ['free', 'pro'], message: 'bad plan' }],
    });
    f.setValue('plan', 'gold');
    expect(await f.validateField('plan')).toBe('bad plan');
    f.setValue('plan', 'pro');
    expect(await f.validateField('plan')).toBeUndefined();
  });

  it('len rule (async-validator) enforces exact length', async () => {
    const f = createForm();
    f.registerField('code', { rules: [{ len: 4, message: 'need 4 chars' }] });
    f.setValue('code', 'ab');
    expect(await f.validateField('code')).toBe('need 4 chars');
    f.setValue('code', 'abcd');
    expect(await f.validateField('code')).toBeUndefined();
  });

  it('whitespace rule (async-validator) rejects whitespace-only strings', async () => {
    const f = createForm();
    f.registerField('title', {
      rules: [{ type: 'string', whitespace: true, message: 'blank' }],
    });
    f.setValue('title', '   ');
    expect(await f.validateField('title')).toBe('blank');
    f.setValue('title', 'hi');
    expect(await f.validateField('title')).toBeUndefined();
  });

  it('type=integer rule (async-validator) rejects floats', async () => {
    const f = createForm();
    f.registerField('n', { rules: [{ type: 'integer', message: 'not int' }] });
    f.setValue('n', 3.5);
    expect(await f.validateField('n')).toBe('not int');
    f.setValue('n', 3);
    expect(await f.validateField('n')).toBeUndefined();
  });

  it('warningOnly still layers on top of async-validator (soft warning)', async () => {
    const f = createForm();
    f.registerField('bio', {
      rules: [
        { required: true, message: 'required' },
        { minLength: 10, warningOnly: true, message: 'longer is better' },
      ],
    });
    f.setValue('bio', 'short');
    const err = await f.validateField('bio');
    // required passes (non-empty); minLength is warningOnly → warning, not error
    expect(err).toBeUndefined();
    expect(f.getFieldWarning('bio')).toBe('longer is better');
    const r = await f.submitForm();
    expect(r.valid).toBe(true);
  });
});
