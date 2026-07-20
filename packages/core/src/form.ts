/**
 * createForm — framework-agnostic form state machine + validation engine.
 * No DOM, no framework deps. See specs/components/input/Form.spec.md.
 *
 * Scope: nested-path values (`users[0].name` via lodash paths, Semi-aligned) /
 * errors / touched / dirty, field registry, sync + async rules run through
 * async-validator (with a `warningOnly` soft-warning superset layered on top),
 * async race-token discard, validate/reset/submitForm, fine-grained subscribe,
 * dependencies graph.
 */
import { useId } from './id.js';
import { pathGet, pathSet, pathHas, pathRemove } from './form-path.js';
import { runFieldRules } from './form-validate.js';

export type FormValues = Record<string, unknown>;

/** Validation message: a string, an i18n-key descriptor, or false/undefined for "no error". */
export type ValidateResult = string | undefined;

/**
 * async-validator `type` union (a superset of the old email/url/number). Any
 * value here routes through async-validator; email/url/number keep our own
 * regex/coercion + i18n messages for backward compatibility.
 */
export type RuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'method'
  | 'regexp'
  | 'integer'
  | 'float'
  | 'array'
  | 'object'
  | 'enum'
  | 'date'
  | 'url'
  | 'hex'
  | 'email';

export interface Rule {
  required?: boolean;
  /** numeric / string-length / value-range checks */
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  /**
   * value type check, delegated to async-validator (Semi-aligned). Supersets the
   * old email/url/number: `array`/`enum`/`integer`/`float`/`object`/... now work.
   */
  type?: RuleType;
  /** exact length check (async-validator `len`; strings/arrays). */
  len?: number;
  /** reject whitespace-only strings (async-validator `whitespace`). */
  whitespace?: boolean;
  /** allowed values for `type: 'enum'` (async-validator `enum`). */
  enum?: Array<string | number | boolean | null | undefined>;
  /** sync or async custom validator; return an error message or undefined */
  validator?: (value: unknown, values: FormValues) => ValidateResult | Promise<ValidateResult>;
  /** override message for the built-in rule on this entry */
  message?: string;
  /**
   * when true, a failure of THIS rule produces a non-blocking warning instead of
   * an error: it surfaces a (yellow) hint but never fails `submit`. Mirrors AntD.
   */
  warningOnly?: boolean;
}

/**
 * When validation should run. Spec §2 L26 / §4 L65. A single trigger or a list.
 * `mount` runs once at registration; `change`/`blur` run on the matching event;
 * `submit` only runs during submit(). The render layer reads `getFieldTrigger`
 * to decide which DOM events to wire — core stays framework-free.
 */
export type ValidateTrigger = 'change' | 'blur' | 'submit' | 'mount';

export interface FieldConfig {
  rules?: Rule[];
  initialValue?: unknown;
  /** label used for interpolating default messages */
  label?: string;
  /**
   * names of other fields this field's validation depends on. When any listed
   * field's value changes (validate-on-change), this field is re-validated too —
   * e.g. a "confirm password" field depends on ["password"].
   */
  dependencies?: string[];
  /**
   * field-level override of the form's `validateTrigger` (spec §4 L84). When
   * omitted the field inherits the form default.
   */
  trigger?: ValidateTrigger | ValidateTrigger[];
  /**
   * pure transform applied to the field's value when collecting values for
   * `getValues`/`submitForm` (spec §4.2 L88). Does NOT mutate state — the live
   * `values` keep the raw value; only the collected payload is transformed.
   */
  transform?: (value: unknown, values: FormValues) => unknown;
}

export type FieldErrors = Record<string, string | undefined>;

export interface FormState {
  values: FormValues;
  errors: FieldErrors;
  /** non-blocking warnings (from `warningOnly` rules); never affect submit validity */
  warnings: FieldErrors;
  touched: Record<string, boolean>;
  validating: Record<string, boolean>;
  submitting: boolean;
  submitCount: number;
}

/** message resolver: built-in messages are emitted as keyed descriptors so the
 *  render layer can localize. We pass label/params so the layer can interpolate. */
export interface MessageDescriptor {
  key: string;
  params?: Record<string, string | number>;
  /** explicit override text (skips i18n) */
  text?: string;
}

export interface FormOptions {
  initialValues?: FormValues;
  /** resolve a MessageDescriptor to a display string (i18n). Defaults to key. */
  resolveMessage?: (d: MessageDescriptor) => string;
  /**
   * default validation trigger(s) for every field (spec §4 L65). Fields may
   * override via `FieldConfig.trigger`. Defaults to `['blur','change']`.
   */
  validateTrigger?: ValidateTrigger | ValidateTrigger[];
  /**
   * stop running a field's rules at the first blocking error (spec §4 L68).
   * Default `false`: every rule runs (so warnings keep accumulating and a later
   * blocking rule can still win); the first blocking error is the surfaced one.
   */
  stopValidateWithError?: boolean;
  /**
   * keep empty-value field keys when collecting values for submit (spec §4 L70).
   * Default `false`: keys whose value is `undefined`/`null`/`''` are dropped
   * from the collected `values` payload.
   */
  allowEmpty?: boolean;
  /**
   * Form-level custom validator (Semi `validator`, recommended). Called on
   * submit / `validate()`. Receives all collected values; returns an errors map
   * ({ [field]: message }) — an empty map (or empty return) means valid.
   * May be sync or async (return a Promise). When set, per-field rules/validators
   * are NOT run on submit/validate (Semi semantics: form-level validator wins).
   */
  validator?: (values: FormValues) => FieldErrors | Promise<FieldErrors> | void | Promise<void>;
  /** deprecated alias of `validator`, kept for compatibility (Semi `validateFields`). */
  validateFields?: (values: FormValues) => FieldErrors | Promise<FieldErrors> | void | Promise<void>;
}

/** options for `formApi.validate` (Semi validate options, v2.94.0+). */
export interface ValidateOptions {
  /** limit validation to these fields; omit to validate all registered fields. */
  fields?: string[];
  /** compute the result without mutating form state (no UI error, no touched, no emit). */
  silent?: boolean;
}

export interface FormApi {
  /** the current form state snapshot (Semi getFormState). */
  getFormState(): FormState;
  subscribe(listener: (state: FormState) => void): () => void;
  registerField(name: string, config?: FieldConfig): () => void;
  /**
   * resolved validation triggers for a field: its own `trigger` override, else
   * the form default. Always a normalized array (spec §4 L65/L84). The render
   * layer uses this to decide which DOM events to wire. Headless superset —
   * Semi has no equivalent; kept un-renamed.
   */
  getFieldTrigger(name: string): ValidateTrigger[];
  /**
   * read a field's value, or (when `name` is omitted) a shallow snapshot of all
   * values (Semi getValue(field?)).
   */
  getValue(name?: string): unknown;
  setValue(name: string, value: unknown, opts?: { validate?: boolean }): void;
  /**
   * batch-write values. Default merges into existing values; `config.isOverride`
   * replaces the whole values object (Semi setValues(values, {isOverride})).
   */
  setValues(values: FormValues, config?: { isOverride?: boolean }): void;
  setTouched(name: string, touched?: boolean): void;
  /** read a field's touched state (Semi getTouched). */
  getTouched(name: string): boolean;
  /** command-imperatively set a field's error (e.g. backend validation) (Semi setError). */
  setError(name: string, error: string | undefined): void;
  /**
   * read a field's error, or (when `name` is omitted) the whole errors map
   * (Semi getError(field?)).
   */
  getError(name?: string): string | undefined | FieldErrors;
  /** the field's non-blocking warning (from a `warningOnly` rule), if any. Headless superset. */
  getFieldWarning(name: string): string | undefined;
  /** whether a field is currently registered (Semi getFieldExist). */
  getFieldExist(name: string): boolean;
  /**
   * a field's initial value, or (when `name` is omitted) a snapshot of all
   * initial values (Semi getInitValue(field?)).
   */
  getInitValue(name?: string): unknown;
  /** snapshot of all initial values (Semi getInitValues). */
  getInitValues(): FormValues;
  /** validate one field; resolves to its (blocking) error (or undefined). Headless superset. */
  validateField(name: string): Promise<string | undefined>;
  /**
   * validate all (or given) fields; resolves to true when valid.
   * - `validate()` / `validate(['a','b'])`: validate all / named fields, surfacing errors in the UI.
   * - `validate({ silent: true })` / `validate({ fields, silent: true })`: silent validation —
   *   compute the result WITHOUT touching form state (no error display, no `touched`, no re-render).
   *   Useful for "should I fire the request?" checks (Semi `validate({ silent })`, v2.94.0+).
   */
  validate(namesOrOptions?: string[] | ValidateOptions): Promise<boolean>;
  /**
   * reset fields to their initial values and clear errors/warnings/touched.
   * With `fields` given, only those fields are reset; otherwise the whole form
   * (Semi reset(fields?)).
   */
  reset(fields?: string[]): void;
  /**
   * collected values honoring `allowEmpty` (spec §4 L70): with `allowEmpty:false`
   * keys whose value is empty (`undefined`/`null`/`''`) are dropped (Semi getValues).
   */
  getValues(): FormValues;
  /** run validation then resolve { valid, values, errors } (Semi submitForm). */
  submitForm(): Promise<{ valid: boolean; values: FormValues; errors: FieldErrors }>;
}

/** the canonical "value is empty" predicate shared by required-rules and allowEmpty. */
function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

/** deep clone a plain values tree so `initial` and live `values` never alias. */
function clone<T>(v: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(v);
    } catch {
      /* value has non-cloneable members (e.g. functions) → fall through */
    }
  }
  return JSON.parse(JSON.stringify(v)) as T;
}

const DEFAULT_TRIGGER: ValidateTrigger[] = ['blur', 'change'];

export function createForm(options: FormOptions = {}): FormApi {
  const resolve = options.resolveMessage ?? ((d) => d.text ?? d.key);
  // the initial values tree (nested; Semi-aligned). Reassigned (immutably) when a
  // field registers its own `initialValue` at a nested path. Deep-cloned into
  // `state.values` so mutating one never leaks into the other.
  let initialTree: FormValues = clone(options.initialValues ?? {});
  const defaultTrigger: ValidateTrigger[] = Array.isArray(options.validateTrigger)
    ? options.validateTrigger
    : options.validateTrigger
      ? [options.validateTrigger]
      : DEFAULT_TRIGGER;
  const stopWithError = options.stopValidateWithError ?? false;
  const allowEmpty = options.allowEmpty ?? false;

  const fields = new Map<string, FieldConfig>();
  // per-field async race token: only the latest validation may write the error
  const tokens = new Map<string, string>();
  // reverse dependency graph: dep field name → set of fields that depend on it.
  // setValue(dep) connects to re-validating the dependents.
  const dependents = new Map<string, Set<string>>();

  const state: FormState = {
    values: clone(initialTree),
    errors: {},
    warnings: {},
    touched: {},
    validating: {},
    submitting: false,
    submitCount: 0,
  };

  const listeners = new Set<(s: FormState) => void>();
  function emit(): void {
    for (const l of listeners) l(state);
  }

  function labelOf(name: string): string {
    return fields.get(name)?.label ?? name;
  }

  /**
   * snapshot of values honoring `allowEmpty` (spec §4 L70), rebuilt as a NESTED
   * tree from each registered field's path (Semi-aligned): a `users[0].name`
   * field lands at `{ users: [{ name }] }`, not a flat `'users[0].name'` key.
   *
   * With the default `allowEmpty:false`, fields whose value is empty are omitted.
   * Registered fields are collected by their path; any remaining top-level keys
   * that no field registered (e.g. values set via `setValues` without a Field)
   * pass through verbatim so nothing is silently dropped.
   */
  function collectValues(): FormValues {
    let out: FormValues = {};
    const seenTop = new Set<string>();
    for (const [name, cfg] of fields) {
      const raw = pathGet(state.values, name);
      // a registered field's `transform` runs over the raw value (pure, no
      // state write-back per red line #2).
      const v = cfg.transform ? cfg.transform(raw, state.values) : raw;
      // `allowEmpty` is decided on the *transformed* value: a transform may turn
      // an empty input into a real value (or vice versa).
      if (allowEmpty || !isEmptyValue(v)) {
        out = pathSet(out, name, v);
        seenTop.add(topSegment(name));
      }
    }
    // pass through top-level keys not owned by any registered field (unregistered
    // values written directly). Registered subtrees already rebuilt above.
    for (const [k, raw] of Object.entries(state.values)) {
      if (seenTop.has(k)) continue;
      if (fieldsCoverTop(k)) continue;
      if (allowEmpty || !isEmptyValue(raw)) out[k] = raw;
    }
    return out;
  }

  /** first path segment of a field name (`users[0].name` → `users`). */
  function topSegment(name: string): string {
    const m = /^[^.[\]]+/.exec(name);
    return m ? m[0] : name;
  }

  /** whether any registered field lives under top-level key `k`. */
  function fieldsCoverTop(k: string): boolean {
    for (const name of fields.keys()) if (topSegment(name) === k) return true;
    return false;
  }

  /**
   * run a field's rules through the async-validator-backed engine (blocking rules
   * + a `warningOnly` soft-warning layer). Returns the first blocking error and
   * the first warning, honoring `stopValidateWithError`.
   */
  async function runRules(
    name: string,
    value: unknown,
  ): Promise<{ error?: string | undefined; warning?: string | undefined }> {
    const cfg = fields.get(name);
    if (!cfg?.rules || cfg.rules.length === 0) return {};
    return runFieldRules(name, value, state.values, cfg.rules, labelOf(name), resolve, stopWithError);
  }

  async function validateField(name: string): Promise<string | undefined> {
    const token = useId('v');
    tokens.set(name, token);
    state.validating = { ...state.validating, [name]: true };
    emit();

    const { error, warning } = await runRules(name, pathGet(state.values, name));

    // race guard: a newer validation superseded this one → discard
    if (tokens.get(name) !== token) return state.errors[name];

    state.validating = { ...state.validating, [name]: false };
    state.errors = { ...state.errors, [name]: error };
    state.warnings = { ...state.warnings, [name]: warning };
    emit();
    return error;
  }

  return {
    getFormState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    registerField(name, config = {}) {
      fields.set(name, config);
      // wire the reverse dependency graph: each dep gains `name` as a dependent.
      for (const dep of config.dependencies ?? []) {
        let set = dependents.get(dep);
        if (!set) dependents.set(dep, (set = new Set()));
        set.add(name);
      }
      if (config.initialValue !== undefined && pathGet(state.values, name) === undefined) {
        state.values = pathSet(state.values, name, config.initialValue);
        initialTree = pathSet(initialTree, name, config.initialValue);
        emit();
      }
      return () => {
        fields.delete(name);
        tokens.delete(name);
        for (const dep of config.dependencies ?? []) dependents.get(dep)?.delete(name);
      };
    },
    getFieldTrigger(name) {
      const t = fields.get(name)?.trigger;
      if (t === undefined) return defaultTrigger;
      return Array.isArray(t) ? t : [t];
    },
    getValue: (name) => (name === undefined ? clone(state.values) : pathGet(state.values, name)),
    setValue(name, value, opts) {
      // immutable nested write: rebuild the branch along `name`'s path so Svelte
      // subscribers see a fresh root reference (never mutate in place).
      state.values = pathSet(state.values, name, value);
      emit();
      if (opts?.validate) void validateField(name);
      // Re-validate downstream fields that depend on this one (e.g. confirm
      // password depends on password) whenever the dependency value changes —
      // independent of whether the *source* field validates itself. We only
      // touch dependents that are already "active" (touched or showing an
      // error), so fields the user hasn't interacted with stay clean.
      for (const dep of dependents.get(name) ?? []) {
        const active =
          state.touched[dep] === true ||
          (state.errors[dep] !== undefined && state.errors[dep] !== '');
        if (active) void validateField(dep);
      }
    },
    setValues(values, config) {
      // isOverride:true replaces the whole (nested) values tree; default merges at
      // the top level (nested subtrees are replaced wholesale, matching Semi's
      // per-field setValue when a subtree object is supplied). Field subscribers
      // re-read on emit. Clone the incoming tree so callers can't alias state.
      state.values = config?.isOverride
        ? clone(values)
        : { ...state.values, ...clone(values) };
      emit();
    },
    setTouched(name, touched = true) {
      state.touched = { ...state.touched, [name]: touched };
      emit();
    },
    getTouched: (name) => state.touched[name] === true,
    setError(name, error) {
      state.errors = { ...state.errors, [name]: error };
      emit();
    },
    getError: (name) =>
      name === undefined ? { ...state.errors } : state.errors[name],
    getFieldWarning: (name) => state.warnings[name],
    getFieldExist: (name) => fields.has(name),
    getInitValue: (name) => (name === undefined ? clone(initialTree) : pathGet(initialTree, name)),
    getInitValues: () => clone(initialTree),
    validateField,
    async validate(namesOrOptions) {
      // normalize the two call shapes: string[] | { fields?, silent? }.
      const opts: ValidateOptions = Array.isArray(namesOrOptions)
        ? { fields: namesOrOptions }
        : (namesOrOptions ?? {});
      const targets = opts.fields ?? [...fields.keys()];

      // Form-level validator (Semi): when set, it REPLACES per-field rules on
      // validate/submit. Runs against collected values; returns { field: msg }.
      const formValidator = options.validator ?? options.validateFields;

      if (opts.silent) {
        // Silent: compute the result without touching state (no emit / touched / error UI).
        if (formValidator) {
          const errs = (await formValidator(collectValues())) || {};
          return Object.values(errs).every((e) => !e);
        }
        const results = await Promise.all(
          targets.map((n) => runRules(n, pathGet(state.values, n)).then((r) => r.error)),
        );
        return results.every((e) => !e);
      }

      if (formValidator) {
        const errs = (await formValidator(collectValues())) || {};
        // surface form-level errors on the targeted fields; clear the rest.
        const next = { ...state.errors };
        for (const n of targets) next[n] = (errs as FieldErrors)[n];
        state.errors = next;
        emit();
        return targets.every((n) => !(errs as FieldErrors)[n]);
      }

      const results = await Promise.all(targets.map((n) => validateField(n)));
      return results.every((e) => !e);
    },
    reset(fields) {
      if (fields && fields.length > 0) {
        // partial reset: only the targeted fields fall back to their initial
        // value (or drop when there is none) and lose error/warning/touched/
        // validating state; everything else is left untouched. Values are read/
        // written by nested path so `users[0].name` resets its leaf, not a flat key.
        let values = state.values;
        const errors = { ...state.errors };
        const warnings = { ...state.warnings };
        const touched = { ...state.touched };
        const validating = { ...state.validating };
        for (const f of fields) {
          if (pathHas(initialTree, f)) values = pathSet(values, f, pathGet(initialTree, f));
          else values = pathRemove(values, f);
          delete errors[f];
          delete warnings[f];
          delete touched[f];
          delete validating[f];
        }
        state.values = values;
        state.errors = errors;
        state.warnings = warnings;
        state.touched = touched;
        state.validating = validating;
        emit();
        return;
      }
      state.values = clone(initialTree);
      state.errors = {};
      state.warnings = {};
      state.touched = {};
      state.validating = {};
      emit();
    },
    getValues: () => collectValues(),
    async submitForm() {
      state.submitting = true;
      state.submitCount += 1;
      emit();
      const targets = [...fields.keys()];
      const formValidator = options.validator ?? options.validateFields;
      if (formValidator) {
        // Form-level validator replaces per-field rules on submit (Semi semantics).
        const errs = ((await formValidator(collectValues())) || {}) as FieldErrors;
        const next = { ...state.errors };
        for (const n of targets) next[n] = errs[n];
        state.errors = next;
      } else {
        await Promise.all(targets.map((n) => validateField(n)));
      }
      const valid = targets.every((n) => !state.errors[n]);
      state.submitting = false;
      emit();
      return { valid, values: collectValues(), errors: { ...state.errors } };
    },
  };
}
