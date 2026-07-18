/**
 * form-validate — rule engine bridged onto `async-validator` (same library Semi
 * uses). Built-in rules are converted to an async-validator schema and run; the
 * `warningOnly` superset (AntD-style soft warnings, absent from async-validator)
 * is layered on top by running the warning rules through the same engine but
 * routing their failures to the warning channel instead of the error channel.
 *
 * i18n bridge: async-validator's default messages use `%s`/fullField templates.
 * To keep our MessageDescriptor + resolveMessage i18n contract intact, each rule
 * carries a precomputed `message` string (from `resolveMessage`) so the engine
 * emits exactly our localized text.
 */
import Schema from 'async-validator';
import type { RuleItem } from 'async-validator';
import type { FormValues, MessageDescriptor, Rule } from './form.js';

type Resolve = (d: MessageDescriptor) => string;

/**
 * Compute the display message for a built-in rule failure (before async-validator
 * runs), honoring an explicit `rule.message` override, else the i18n descriptor.
 */
function builtinMessage(rule: Rule, label: string, resolve: Resolve): string | undefined {
  if (rule.message !== undefined) return rule.message;
  // pick the descriptor matching the (single) built-in check this rule expresses.
  if (rule.required) return resolve({ key: 'Form.required', params: { label } });
  if (rule.type === 'email' || rule.type === 'url')
    return resolve({ key: 'Form.typeError', params: { label } });
  if (rule.type === 'number' || rule.type === 'integer' || rule.type === 'float')
    return resolve({ key: 'Form.typeError', params: { label } });
  if (rule.type !== undefined) return resolve({ key: 'Form.typeError', params: { label } });
  if (rule.minLength !== undefined)
    return resolve({ key: 'Form.minLength', params: { min: rule.minLength } });
  if (rule.maxLength !== undefined)
    return resolve({ key: 'Form.maxLength', params: { max: rule.maxLength } });
  if (rule.min !== undefined) return resolve({ key: 'Form.min', params: { min: rule.min } });
  if (rule.max !== undefined) return resolve({ key: 'Form.max', params: { max: rule.max } });
  if (rule.pattern) return resolve({ key: 'Form.pattern', params: { label } });
  return undefined;
}

/** async-validator `type` alias: our `number` maps to its numeric semantics. */
function avType(t: NonNullable<Rule['type']>): RuleItem['type'] {
  // async-validator uses `number`/`integer`/`float`/`array`/`enum`/... verbatim.
  return t as RuleItem['type'];
}

/**
 * Convert one of our Rules to an async-validator RuleItem. `value`/`values` are
 * threaded so a custom `validator(value, values)` (our signature) can be adapted
 * to async-validator's `validator(rule, value, callback)`.
 *
 * Length semantics: our `minLength`/`maxLength` are string-length checks; we
 * emulate them with a `validator` (async-validator's `min`/`max` on a string
 * measure string length too, but only paired with an explicit `type:'string'` —
 * a custom validator keeps behavior identical to the previous hand-rolled engine).
 */
function toAvRule(rule: Rule, label: string, values: FormValues, resolve: Resolve): RuleItem {
  const message = builtinMessage(rule, label, resolve);
  const item: RuleItem = {};
  if (message !== undefined) item.message = message;

  // custom validator: adapt (value, values) → callback. A truthy string return
  // is the (overriding) error message; falsy/undefined means pass.
  if (rule.validator) {
    const fn = rule.validator;
    item.validator = (_r, value, callback) => {
      try {
        const res = fn(value, values);
        if (res instanceof Promise) {
          res
            .then((m) => callback(m ? String(m) : undefined))
            .catch((e) => callback(e instanceof Error ? e.message : String(e)));
          return;
        }
        callback(res ? String(res) : undefined);
      } catch (e) {
        callback(e instanceof Error ? e.message : String(e));
      }
    };
    return item;
  }

  if (rule.required) item.required = true;

  // string-length checks (our supersets of async-validator len/min/max)
  if (rule.minLength !== undefined || rule.maxLength !== undefined) {
    const min = rule.minLength;
    const max = rule.maxLength;
    item.validator = (_r, value, callback) => {
      // empty values are skipped by required/other rules; length rules only fire
      // on non-empty input (mirrors the previous engine's `isEmpty` short-circuit).
      if (value === undefined || value === null || value === '') return callback();
      const len = String(value).length;
      if (min !== undefined && len < min) return callback(message);
      if (max !== undefined && len > max) return callback(message);
      callback();
    };
    return item;
  }

  // email/url/number → our own regexes/coercion (keeps messages + edge cases
  // identical to the prior engine, avoids async-validator's stricter url/email).
  if (rule.type === 'email' || rule.type === 'url' || rule.type === 'number') {
    const kind = rule.type;
    item.validator = (_r, value, callback) => {
      if (value === undefined || value === null || value === '') return callback();
      const s = String(value);
      const ok =
        kind === 'email'
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
          : kind === 'url'
            ? /^https?:\/\/[^\s]+$/.test(s)
            : !Number.isNaN(Number(s));
      callback(ok ? undefined : message);
    };
    return item;
  }

  // remaining async-validator-native `type` (array/enum/integer/float/object/
  // boolean/date/hex): delegate straight to async-validator's built-in type check.
  if (rule.type !== undefined) {
    const t = avType(rule.type);
    if (t !== undefined) item.type = t;
  }

  // numeric range (async-validator `min`/`max` on numbers) — emulate to keep the
  // exact message + coercion the prior engine used.
  if (rule.min !== undefined || rule.max !== undefined) {
    const min = rule.min;
    const max = rule.max;
    item.validator = (_r, value, callback) => {
      if (value === undefined || value === null || value === '') return callback();
      const n = Number(value);
      if (min !== undefined && n < min) return callback(message);
      if (max !== undefined && n > max) return callback(message);
      callback();
    };
    return item;
  }

  // pattern
  if (rule.pattern) {
    const re = rule.pattern;
    item.validator = (_r, value, callback) => {
      if (value === undefined || value === null || value === '') return callback();
      callback(re.test(String(value)) ? undefined : message);
    };
    return item;
  }

  // async-validator-native extras that pass straight through
  if (rule.len !== undefined) item.len = rule.len;
  if (rule.whitespace !== undefined) item.whitespace = rule.whitespace;
  if (rule.enum !== undefined) item.enum = rule.enum;

  return item;
}

/**
 * Run one field's rules through async-validator (built-ins + custom), splitting
 * `warningOnly` failures into the warning channel. Returns the first blocking
 * error and the first warning, honoring `stopValidateWithError`.
 */
export async function runFieldRules(
  field: string,
  value: unknown,
  values: FormValues,
  rules: Rule[],
  label: string,
  resolve: Resolve,
  stopWithError: boolean,
): Promise<{ error?: string; warning?: string }> {
  const blocking = rules.filter((r) => !r.warningOnly);
  const warns = rules.filter((r) => r.warningOnly);

  const error = await runSchema(field, value, values, blocking, label, resolve, stopWithError);
  // warnings always accumulate independently (never affect blocking validity).
  const warning = await runSchema(field, value, values, warns, label, resolve, true);

  const out: { error?: string; warning?: string } = {};
  if (error !== undefined) out.error = error;
  if (warning !== undefined) out.warning = warning;
  return out;
}

async function runSchema(
  field: string,
  value: unknown,
  values: FormValues,
  rules: Rule[],
  label: string,
  resolve: Resolve,
  first: boolean,
): Promise<string | undefined> {
  if (rules.length === 0) return undefined;
  const descriptor: Record<string, RuleItem[]> = {
    [field]: rules.map((r) => toAvRule(r, label, values, resolve)),
  };
  const schema = new Schema(descriptor);
  try {
    // `first: true` stops at the first failing rule (our stopValidateWithError).
    await schema.validate({ [field]: value }, { first, suppressWarning: true });
    return undefined;
  } catch (err) {
    const e = err as { errors?: Array<{ message?: string }> | null };
    if (e.errors && e.errors.length > 0) {
      // first blocking error message (empty string preserved as a real failure).
      const m = e.errors[0]?.message;
      return m === undefined ? '' : String(m);
    }
    // schema/grammar error → surface its message
    return err instanceof Error ? err.message : String(err);
  }
}
