<!--
  Switch — see specs/components/input/Switch.spec.md
  Native role="switch" button, controlled / uncontrolled.

  ⚠️ 死循环红线：
    - 受控（value=/bind:value）：父持有 value，仅经 onChange 上抛，绝不回写 prop（红线 #1）。
    - 派生（on / nativeValue / cls / activeChildren）均为纯函数 $derived（红线 #2）。
    - autofocus：$effect 内命令式 focus()，无 cleanup 必要（focus 一次性）；
      announceOnChange 的 live region 写入在事件回调（非 render 期），$effect 仅清空兜底（红线 #3）。
  - checkedValue/uncheckedValue：开/关态映射到任意业务值，仅用于 onChange.nativeValue 与
    隐藏 input 提交值；on 仍为 boolean，映射不回写。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';
  type NativeValue = string | number | boolean;

  interface Props {
    value?: boolean;
    defaultValue?: boolean;
    /** 开态对应的实际值（onChange.nativeValue 与表单提交值）。 */
    checkedValue?: NativeValue;
    /** 关态对应的实际值。 */
    uncheckedValue?: NativeValue;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    loading?: boolean;
    checkedChildren?: string | Snippet;
    uncheckedChildren?: string | Snippet;
    name?: string;
    /** 表单必填校验（须为开态）。 */
    required?: boolean;
    ariaLabel?: string;
    /** 切换后是否用 live region 播报新状态（文案经 locale）。 */
    announceOnChange?: boolean;
    /** 挂载后自动聚焦。 */
    autofocus?: boolean;
    onChange?: (
      v: boolean,
      detail?: { value: boolean; nativeValue: NativeValue; event: Event },
    ) => void;
  }

  let {
    value = $bindable(),
    defaultValue = false,
    checkedValue = true,
    uncheckedValue = false,
    size = 'default',
    status = 'default',
    disabled = false,
    loading = false,
    checkedChildren,
    uncheckedChildren,
    name,
    required = false,
    ariaLabel,
    announceOnChange = false,
    autofocus = false,
    onChange,
  }: Props = $props();

  const loc = useLocale();

  const isControlled = $derived(value !== undefined);
  let inner = $state(getInitialValue());
  const on = $derived(isControlled ? !!value : inner);

  function getInitialValue(): boolean {
    return defaultValue;
  }

  const interactable = $derived(!disabled && !loading);

  // 映射到业务值（红线 #2 纯派生）：仅用于 onChange.nativeValue 与表单提交。
  const nativeValue = $derived<NativeValue>(on ? checkedValue : uncheckedValue);

  // 切换播报 live region（命令式写入，初始空；render 期只读 $state）。
  let announceText = $state('');

  let rootEl: HTMLButtonElement | undefined;

  // autofocus：命令式聚焦一次（红线 #3，SSR 安全，$effect 仅 client）。
  $effect(() => {
    if (autofocus && rootEl && interactable) rootEl.focus();
  });

  function announce(next: boolean) {
    if (!announceOnChange) return;
    announceText = '';
    // 微任务后再写入，先清空再赋值，触发 AT 重新播报。
    queueMicrotask(() => {
      announceText = loc().t(next ? 'Switch.announceChecked' : 'Switch.announceUnchecked');
    });
  }

  function toggle(event: Event) {
    if (!interactable) return;
    const next = !on;
    // Controlled (`value=` / `bind:value`): parent owns `value`; propagate only
    // via `onChange`. Writing the prop AND firing `onChange` loops.
    // Uncontrolled: keep our own state in sync.
    if (!isControlled) inner = next;
    const nv = next ? checkedValue : uncheckedValue;
    onChange?.(next, { value: next, nativeValue: nv, event });
    announce(next);
  }

  const activeChildren = $derived(on ? checkedChildren : uncheckedChildren);
  const isSnippet = (c: string | Snippet | undefined): c is Snippet => typeof c === 'function';

  // 隐藏 input 提交值：boolean → 'true'/'false'，其余按原值字符串化。
  const submitValue = $derived(
    typeof nativeValue === 'boolean' ? (nativeValue ? 'true' : 'false') : String(nativeValue),
  );

  const cls = $derived(
    ['cd-switch', `cd-switch--${size}`, `cd-switch--${status}`, on && 'cd-switch--on']
      .filter(Boolean)
      .join(' '),
  );
</script>

<button
  bind:this={rootEl}
  type="button"
  role="switch"
  class={cls}
  aria-checked={on}
  aria-label={ariaLabel}
  aria-busy={loading || undefined}
  aria-required={required || undefined}
  aria-invalid={status === 'error' || undefined}
  disabled={disabled || loading}
  onclick={toggle}
>
  {#if name}<input type="hidden" {name} value={submitValue} {required} />{/if}
  {#if activeChildren !== undefined}
    <span class="cd-switch__label">
      {#if isSnippet(activeChildren)}{@render activeChildren()}{:else}{activeChildren}{/if}
    </span>
  {/if}
  <span class="cd-switch__knob">
    {#if loading}<span class="cd-switch__spinner" aria-hidden="true"></span>{/if}
  </span>
</button>

{#if announceOnChange}
  <!-- 切换播报 live region：视觉隐藏，仅供辅助技术读取（render 期只读 $state）。 -->
  <div class="cd-switch__sr-live" role="status" aria-live="polite" aria-atomic="true">
    {announceText}
  </div>
{/if}

<style>
  .cd-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    inline-size: var(--cd-switch-width-default);
    block-size: var(--cd-switch-height-default);
    padding: 0;
    border: none;
    border-radius: var(--cd-switch-radius);
    background: var(--cd-switch-bg-off);
    cursor: pointer;
    transition: background-color var(--cd-motion-duration-mid) var(--cd-motion-ease-standard);
  }
  .cd-switch--small {
    inline-size: var(--cd-switch-width-small);
    block-size: var(--cd-switch-height-small);
  }
  .cd-switch--large {
    inline-size: var(--cd-switch-width-large);
    block-size: var(--cd-switch-height-large);
  }
  .cd-switch--on {
    background: var(--cd-switch-bg-on);
    justify-content: flex-end;
  }
  .cd-switch--warning.cd-switch--on {
    background: var(--cd-color-warning);
  }
  .cd-switch--error.cd-switch--on {
    background: var(--cd-color-danger);
  }
  .cd-switch:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-switch:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-switch__knob {
    position: absolute;
    inset-block: 2px;
    inset-inline-start: 2px;
    aspect-ratio: 1;
    block-size: calc(100% - 4px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cd-radius-full);
    background: var(--cd-switch-knob-bg);
    transition: inset-inline-start var(--cd-motion-duration-mid) var(--cd-motion-ease-standard);
  }
  .cd-switch--on .cd-switch__knob {
    inset-inline-start: calc(100% - 2px);
    transform: translateX(-100%);
  }
  .cd-switch__label {
    color: var(--cd-color-text-inverse);
    font-size: var(--cd-font-size-1);
    line-height: 1;
    padding-inline: var(--cd-spacing-2);
  }
  .cd-switch--on .cd-switch__label {
    padding-inline-start: var(--cd-spacing-3);
    padding-inline-end: var(--cd-spacing-5);
  }
  .cd-switch__spinner {
    inline-size: 60%;
    aspect-ratio: 1;
    border: 2px solid var(--cd-color-grey-3);
    border-block-start-color: var(--cd-color-primary);
    border-radius: var(--cd-radius-full);
    animation: cd-switch-spin var(--cd-motion-duration-slow) linear infinite;
  }
  @keyframes cd-switch-spin {
    to {
      transform: rotate(360deg);
    }
  }
  /* 视觉隐藏但对辅助技术可见（不可用 display:none / visibility:hidden）。 */
  .cd-switch__sr-live {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-switch,
    .cd-switch__knob {
      transition: none;
    }
    .cd-switch__spinner {
      animation: none;
    }
  }
</style>
