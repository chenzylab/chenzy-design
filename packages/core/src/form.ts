/**
 * createForm — framework-agnostic form state machine + validation engine.
 * No DOM, no framework deps. See specs/components/input/Form.spec.md.
 *
 * Scope (foundational subset): values/errors/touched/dirty, field registry,
 * sync + async rules (required/min/max/minLength/maxLength/pattern/type/validator),
 * async race-token discard, validate/resetFields/submit, fine-grained subscribe.
 * Deferred: nested-path arrays beyond simple dot paths, dependencies graph.
 */
import { useId } from './id.js';

export type FormValues = Record<string, unknown>;

/** Validation message: a string, an i18n-key descriptor, or false/undefined for "no error". */
export type ValidateResult = string | undefined;

export interface Rule {
  required?: boolean;
  /** numeric / string-length / value-range checks */
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'email' | 'url' | 'number';
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
   * `getFieldsValue`/`submit` (spec §4.2 L88). Does NOT mutate state — the live
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
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/;

export interface FormApi {
  getState(): FormState;
  subscribe(listener: (state: FormState) => void): () => void;
  registerField(name: string, config?: FieldConfig): () => void;
  /**
   * resolved validation triggers for a field: its own `trigger` override, else
   * the form default. Always a normalized array (spec §4 L65/L84). The render
   * layer uses this to decide which DOM events to wire.
   */
  getFieldTrigger(name: string): ValidateTrigger[];
  getFieldValue(name: string): unknown;
  setFieldValue(name: string, value: unknown, opts?: { validate?: boolean }): void;
  setFieldsValue(values: FormValues): void;
  setFieldTouched(name: string, touched?: boolean): void;
  getFieldError(name: string): string | undefined;
  /** the field's non-blocking warning (from a `warningOnly` rule), if any */
  getFieldWarning(name: string): string | undefined;
  /** validate one field; resolves to its (blocking) error (or undefined) */
  validateField(name: string): Promise<string | undefined>;
  /** validate all (or given) fields; resolves to true when valid */
  validate(names?: string[]): Promise<boolean>;
  resetFields(): void;
  /**
   * collected values honoring `allowEmpty` (spec §4 L70): with `allowEmpty:false`
   * keys whose value is empty (`undefined`/`null`/`''`) are dropped.
   */
  getFieldsValue(): FormValues;
  /** run validation then resolve { valid, values, errors } */
  submit(): Promise<{ valid: boolean; values: FormValues; errors: FieldErrors }>;
}

/** the canonical "value is empty" predicate shared by required-rules and allowEmpty. */
function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === '';
}

const DEFAULT_TRIGGER: ValidateTrigger[] = ['blur', 'change'];

export function createForm(options: FormOptions = {}): FormApi {
  const resolve = options.resolveMessage ?? ((d) => d.text ?? d.key);
  const initial: FormValues = { ...(options.initialValues ?? {}) };
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
  // setFieldValue(dep) connects to re-validating the dependents.
  const dependents = new Map<string, Set<string>>();

  const state: FormState = {
    values: { ...initial },
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
   * snapshot of values honoring `allowEmpty` (spec §4 L70). With the default
   * `allowEmpty:false`, keys whose value is empty are omitted from the payload.
   */
  function collectValues(): FormValues {
    const out: FormValues = {};
    for (const [k, raw] of Object.entries(state.values)) {
      // a registered field's `transform` runs over the raw value (pure, no
      // state write-back per red line #2). Unregistered keys pass through.
      const transform = fields.get(k)?.transform;
      const v = transform ? transform(raw, state.values) : raw;
      // `allowEmpty` is decided on the *transformed* value: a transform may turn
      // an empty input into a real value (or vice versa).
      if (allowEmpty || !isEmptyValue(v)) out[k] = v;
    }
    return out;
  }

  /**
   * run all rules for a field. Returns the first blocking error and the first
   * warning (from a `warningOnly` rule), if any. A failing `warningOnly` rule
   * records a warning but does NOT halt evaluation — later rules still run, so a
   * real error can still win. A failing normal rule short-circuits with an error.
   */
  async function runRules(
    name: string,
    value: unknown,
  ): Promise<{ error?: string | undefined; warning?: string | undefined }> {
    const cfg = fields.get(name);
    if (!cfg?.rules) return {};
    const label = labelOf(name);
    let warning: string | undefined;
    // first blocking error seen. With stopValidateWithError we return on it
    // immediately; otherwise we keep scanning (so warnings accumulate and the
    // semantics of "run all rules" hold) but still surface this first one.
    let firstError: string | undefined;

    // route a failed rule's message: warningOnly → record warning & continue;
    // otherwise capture it as the blocking error. Returns a result object only
    // when evaluation must halt (stopValidateWithError + a blocking error).
    const fail = (
      rule: Rule,
      d: MessageDescriptor,
    ): { error?: string | undefined; warning?: string | undefined } | undefined => {
      const text = rule.message ?? resolve(d);
      if (rule.warningOnly) {
        if (warning === undefined) warning = text;
        return undefined; // keep scanning subsequent rules
      }
      if (firstError === undefined) firstError = text;
      if (stopWithError) return { error: firstError, warning };
      return undefined; // keep scanning subsequent rules
    };

    for (const rule of cfg.rules) {
      const isEmpty = isEmptyValue(value);

      if (rule.required && isEmpty) {
        const r = fail(rule, { key: 'Form.required', params: { label } });
        if (r) return r;
        continue;
      }
      if (isEmpty) continue; // other rules skip empty values

      let descriptor: MessageDescriptor | undefined;
      if (rule.type === 'email' && !EMAIL_RE.test(String(value))) {
        descriptor = { key: 'Form.typeError', params: { label } };
      } else if (rule.type === 'url' && !URL_RE.test(String(value))) {
        descriptor = { key: 'Form.typeError', params: { label } };
      } else if (rule.type === 'number' && Number.isNaN(Number(value))) {
        descriptor = { key: 'Form.typeError', params: { label } };
      } else if (rule.minLength !== undefined && String(value).length < rule.minLength) {
        descriptor = { key: 'Form.minLength', params: { min: rule.minLength } };
      } else if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
        descriptor = { key: 'Form.maxLength', params: { max: rule.maxLength } };
      } else if (rule.min !== undefined && Number(value) < rule.min) {
        descriptor = { key: 'Form.min', params: { min: rule.min } };
      } else if (rule.max !== undefined && Number(value) > rule.max) {
        descriptor = { key: 'Form.max', params: { max: rule.max } };
      } else if (rule.pattern && !rule.pattern.test(String(value))) {
        descriptor = { key: 'Form.pattern', params: { label } };
      }
      if (descriptor) {
        const r = fail(rule, descriptor);
        if (r) return r;
        continue;
      }

      if (rule.validator) {
        const v = await rule.validator(value, state.values);
        if (v) {
          const r = fail(rule, { text: v, key: '' });
          if (r) return r;
        }
      }
    }
    return { error: firstError, warning };
  }

  async function validateField(name: string): Promise<string | undefined> {
    const token = useId('v');
    tokens.set(name, token);
    state.validating = { ...state.validating, [name]: true };
    emit();

    const { error, warning } = await runRules(name, state.values[name]);

    // race guard: a newer validation superseded this one → discard
    if (tokens.get(name) !== token) return state.errors[name];

    state.validating = { ...state.validating, [name]: false };
    state.errors = { ...state.errors, [name]: error };
    state.warnings = { ...state.warnings, [name]: warning };
    emit();
    return error;
  }

  return {
    getState: () => state,
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
      if (config.initialValue !== undefined && state.values[name] === undefined) {
        state.values = { ...state.values, [name]: config.initialValue };
        initial[name] = config.initialValue;
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
    getFieldValue: (name) => state.values[name],
    setFieldValue(name, value, opts) {
      state.values = { ...state.values, [name]: value };
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
    setFieldsValue(values) {
      state.values = { ...state.values, ...values };
      emit();
    },
    setFieldTouched(name, touched = true) {
      state.touched = { ...state.touched, [name]: touched };
      emit();
    },
    getFieldError: (name) => state.errors[name],
    getFieldWarning: (name) => state.warnings[name],
    validateField,
    async validate(names) {
      const targets = names ?? [...fields.keys()];
      const results = await Promise.all(targets.map((n) => validateField(n)));
      return results.every((e) => !e);
    },
    resetFields() {
      state.values = { ...initial };
      state.errors = {};
      state.warnings = {};
      state.touched = {};
      state.validating = {};
      emit();
    },
    getFieldsValue: () => collectValues(),
    async submit() {
      state.submitting = true;
      state.submitCount += 1;
      emit();
      const targets = [...fields.keys()];
      await Promise.all(targets.map((n) => validateField(n)));
      const valid = targets.every((n) => !state.errors[n]);
      state.submitting = false;
      emit();
      return { valid, values: collectValues(), errors: { ...state.errors } };
    },
  };
}
