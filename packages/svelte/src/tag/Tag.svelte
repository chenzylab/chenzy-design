<!--
  Tag — see specs/components/show/Tag.spec.md
  Display atom. Controlled checked/visible never written back (only onChange/onClose).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import Avatar from '../avatar/Avatar.svelte';

  type TagType = 'light' | 'solid' | 'ghost';
  type TagColor = 'grey' | 'primary' | 'success' | 'warning' | 'danger';
  type TagSize = 'small' | 'default' | 'large';
  type TagShape = 'square' | 'circle';

  interface Props {
    type?: TagType;
    color?: TagColor;
    size?: TagSize;
    shape?: TagShape;
    closable?: boolean;
    /** controlled visibility; when false the tag is not rendered */
    visible?: boolean;
    checkable?: boolean;
    /** controlled checked state */
    checked?: boolean;
    disabled?: boolean;
    onClose?: () => void;
    onChange?: (checked: boolean) => void;
    children?: Snippet;
    prefixIcon?: Snippet;
    /** 后置图标（与 closable 互不冲突，关闭图标始终最右） */
    suffixIcon?: Snippet;
    /** 头像型 Tag 的图片地址 */
    avatarSrc?: string;
    /** 头像形状 */
    avatarShape?: 'square' | 'circle';
    /** 自定义关闭图标（默认内置 X） */
    closeIcon?: Snippet;
    /**
     * 标签纯文本，仅用于派生 closable 关闭按钮的无障碍名（如「移除 已完成」）。
     * children 为 Snippet 无法取文本，故由调用方显式提供；缺省时关闭按钮退回通用「关闭」标签。
     */
    tagText?: string;
    /** 在 TagGroup 中的稳定标识 */
    tagKey?: string | number;
    /** 透传根类名 */
    class?: string;
    /** 透传根内联样式 */
    style?: string;
  }

  let {
    type = 'light',
    color = 'grey',
    size = 'default',
    shape = 'square',
    closable = false,
    visible,
    checkable = false,
    checked,
    disabled = false,
    onClose,
    onChange,
    children,
    prefixIcon,
    suffixIcon,
    avatarSrc,
    avatarShape = 'square',
    closeIcon,
    tagText,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // closable 关闭按钮无障碍名：有 tagText 时派生「移除 <文本>」（i18n Tag.closeAriaLabel），
  // 缺省退回通用「关闭」（Tag.close），保证按钮永远有可读名。
  const closeLabel = $derived(
    tagText !== undefined && tagText !== ''
      ? loc().t('Tag.closeAriaLabel', { label: tagText })
      : loc().t('Tag.close'),
  );

  // --- visible: controlled vs uncontrolled (never write the prop back) ---
  const visibleControlled = $derived(visible !== undefined);
  let innerVisible = $state(true);
  const currentVisible = $derived(visibleControlled ? !!visible : innerVisible);

  // --- checked: controlled vs uncontrolled (never write the prop back) ---
  const checkedControlled = $derived(checked !== undefined);
  let innerChecked = $state(false);
  const currentChecked = $derived(checkedControlled ? !!checked : innerChecked);

  const cls = $derived(
    [
      'cd-tag',
      `cd-tag--${type}`,
      `cd-tag--${color}`,
      `cd-tag--${size}`,
      `cd-tag--${shape}`,
      checkable && 'cd-tag--checkable',
      checkable && currentChecked && 'cd-tag--checked',
      disabled && 'cd-tag--disabled',
      avatarSrc && 'cd-tag--has-avatar',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // avatar sizing follows tag size; keep avatar compact within the tag
  const avatarSize = $derived(
    size === 'small' ? 16 : size === 'large' ? 24 : 20,
  );

  function handleToggle() {
    if (disabled || !checkable) return;
    const next = !currentChecked;
    // Controlled: parent owns `checked`; propagate via onChange only.
    if (!checkedControlled) innerChecked = next;
    onChange?.(next);
  }

  function handleClose(e: MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    // Controlled: parent owns `visible` and must set it false.
    if (!visibleControlled) innerVisible = false;
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!checkable || disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  }
</script>

{#if currentVisible}
  {#if checkable}
    <span
      class={cls}
      {style}
      role="checkbox"
      aria-checked={currentChecked}
      aria-disabled={disabled || undefined}
      tabindex={disabled ? -1 : 0}
      onclick={handleToggle}
      onkeydown={handleKeydown}
    >
      {@render leading()}
      {#if children}<span class="cd-tag__content">{@render children()}</span>{/if}
      {@render trailing()}
    </span>
  {:else}
    <span class={cls} {style}>
      {@render leading()}
      {#if children}<span class="cd-tag__content">{@render children()}</span>{/if}
      {@render trailing()}
      {#if closable}
        <button
          type="button"
          class="cd-tag__close"
          aria-label={closeLabel}
          disabled={disabled || undefined}
          onclick={handleClose}
        >
          {#if closeIcon}
            {@render closeIcon()}
          {:else}
            <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                d="M4 4 L12 12 M12 4 L4 12"
              />
            </svg>
          {/if}
        </button>
      {/if}
    </span>
  {/if}
{/if}

<!-- leading: avatar (highest priority) then prefix icon -->
{#snippet leading()}
  {#if avatarSrc}
    <span class="cd-tag__avatar">
      <Avatar src={avatarSrc} shape={avatarShape} size={avatarSize} />
    </span>
  {/if}
  {#if prefixIcon}<span class="cd-tag__prefix">{@render prefixIcon()}</span>{/if}
{/snippet}

<!-- trailing: suffix icon (closable's X is rendered separately, always rightmost) -->
{#snippet trailing()}
  {#if suffixIcon}<span class="cd-tag__suffix">{@render suffixIcon()}</span>{/if}
{/snippet}

<style>
  .cd-tag {
    --cd-tag-semantic: var(--cd-color-text-1);
    --cd-tag-surface: var(--cd-color-bg-0);
    display: inline-flex;
    align-items: center;
    gap: var(--cd-tag-gap);
    block-size: var(--cd-tag-height-default);
    padding-inline: var(--cd-tag-padding-x);
    border: 1px solid transparent;
    border-radius: var(--cd-tag-radius);
    font-size: var(--cd-tag-font-size);
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
    box-sizing: border-box;
  }
  .cd-tag--small {
    block-size: var(--cd-tag-height-small);
  }
  .cd-tag--large {
    block-size: var(--cd-tag-height-large);
  }
  .cd-tag--circle {
    border-radius: var(--cd-radius-full);
  }

  /* color → semantic mapping */
  .cd-tag--grey {
    --cd-tag-semantic: var(--cd-color-text-1);
  }
  .cd-tag--primary {
    --cd-tag-semantic: var(--cd-color-primary);
  }
  .cd-tag--success {
    --cd-tag-semantic: var(--cd-color-success);
  }
  .cd-tag--warning {
    --cd-tag-semantic: var(--cd-color-warning);
  }
  .cd-tag--danger {
    --cd-tag-semantic: var(--cd-color-danger);
  }

  /* light: tinted background + strong text */
  .cd-tag--light {
    background: color-mix(in srgb, var(--cd-tag-semantic) 12%, var(--cd-tag-surface));
    color: var(--cd-tag-semantic);
  }
  .cd-tag--light.cd-tag--grey {
    background: var(--cd-color-fill-0);
    color: var(--cd-color-text-0);
  }

  /* solid: filled background + inverse text */
  .cd-tag--solid {
    background: var(--cd-tag-semantic);
    color: var(--cd-color-text-inverse);
  }
  .cd-tag--solid.cd-tag--grey {
    background: var(--cd-color-text-2);
    color: var(--cd-color-text-inverse);
  }
  .cd-tag--solid.cd-tag--warning {
    color: var(--cd-color-text-inverse);
  }

  /* ghost: transparent background + border */
  .cd-tag--ghost {
    background: transparent;
    border-color: var(--cd-tag-semantic);
    color: var(--cd-tag-semantic);
  }
  .cd-tag--ghost.cd-tag--grey {
    border-color: var(--cd-color-border);
    color: var(--cd-color-text-1);
  }

  /* checkable chip */
  .cd-tag--checkable {
    cursor: pointer;
    user-select: none;
    transition:
      background-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard),
      border-color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tag--checkable:not(.cd-tag--checked) {
    background: var(--cd-color-fill-0);
    border-color: transparent;
    color: var(--cd-color-text-1);
  }
  .cd-tag--checkable.cd-tag--checked {
    background: var(--cd-tag-semantic);
    color: var(--cd-color-text-inverse);
    border-color: transparent;
  }
  .cd-tag--checkable.cd-tag--checked.cd-tag--grey {
    background: var(--cd-color-primary);
  }
  .cd-tag--checkable.cd-tag--checked.cd-tag--warning {
    color: var(--cd-color-text-inverse);
  }
  .cd-tag--checkable:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }

  .cd-tag--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .cd-tag__prefix,
  .cd-tag__suffix,
  .cd-tag__content {
    display: inline-flex;
    align-items: center;
  }

  .cd-tag__avatar {
    display: inline-flex;
    align-items: center;
    margin-inline-start: calc(var(--cd-tag-padding-x) * -0.5);
  }

  .cd-tag__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 1em;
    block-size: 1em;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    opacity: 0.7;
    border-radius: var(--cd-radius-full);
  }
  .cd-tag__close:hover {
    opacity: 1;
  }
  .cd-tag__close:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .cd-tag__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-tag__close svg {
    inline-size: 100%;
    block-size: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-tag--checkable {
      transition: none;
    }
  }
</style>
