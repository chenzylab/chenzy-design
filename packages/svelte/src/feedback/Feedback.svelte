<!--
  Feedback — see specs/components/feedback/Feedback.spec.md
  用户反馈收集弹窗（对标 Semi Feedback）。纯组合本库外壳 + 内容子控件：
    mode=modal → Modal 外壳；mode=popup → SideSheet 外壳。
    type=text → TextArea；emoji → radiogroup 表情行；radio → RadioGroup；
    checkbox → CheckboxGroup；custom → renderContent / content slot。
  外壳的 focus-trap / inert / Esc / 背景锁滚均由 Modal / SideSheet 内置，直接复用。
  emoji 评分自建 role=radiogroup + 方向键（参照 Rating 键盘范式）。
  value 归一化内联（spec §3 允许内联，逻辑简单）：string / string[] / EmojiResult。

  exactOptionalPropertyTypes：透传给子组件的可选 prop 用条件 spread，
  绝不显式传 undefined（{...v !== undefined ? { v } : {}}）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Modal } from '../modal/index.js';
  import { SideSheet } from '../side-sheet/index.js';
  import { TextArea } from '../textarea/index.js';
  import { RadioGroup } from '../radio/index.js';
  import { CheckboxGroup } from '../checkbox/index.js';
  import { useLocale } from '../locale-provider/index.js';

  export type FeedbackMode = 'modal' | 'popup';
  export type FeedbackType = 'text' | 'emoji' | 'radio' | 'checkbox' | 'custom';
  /** emoji 类型的反馈值：可含 emoji 选择与附加文本。 */
  export interface EmojiResult {
    emoji?: string;
    text?: string;
  }
  export type FeedbackValue = string | string[] | EmojiResult;

  /** radio / checkbox 类型的可选项。 */
  export interface FeedbackOption {
    label: string;
    value: string;
    disabled?: boolean;
  }

  /** renderContent 上下文：当前值 + 归一化写值方法。 */
  export interface FeedbackContentContext {
    value: FeedbackValue | undefined;
    setValue: (v: FeedbackValue) => void;
  }

  interface Props {
    /** 呈现形态：modal=Modal 弹窗；popup=SideSheet 抽屉。 */
    mode?: FeedbackMode;
    /** 反馈类型。默认 text（最基础的文本反馈）。 */
    type?: FeedbackType;
    /** 反馈值（受控）。 */
    value?: FeedbackValue;
    /** 反馈值变化。 */
    onValueChange?: (value: FeedbackValue) => void;
    /** radio / checkbox 类型的可选项。 */
    options?: FeedbackOption[];
    /** 文本输入透传本库 TextArea props。 */
    textAreaProps?: Record<string, unknown>;
    /** 自定义/包裹反馈内容区（type=custom 或需覆盖内容时）。 */
    renderContent?: Snippet<[FeedbackContentContext]>;
    /** content slot 等价 renderContent。 */
    content?: Snippet<[FeedbackContentContext]>;
    /** 提交回调（可异步，await 期间外壳 loading）。 */
    onOk?: (e: { value: FeedbackValue | undefined }) => void | Promise<unknown>;
    /** 取消回调。 */
    onCancel?: () => void | Promise<unknown>;
    /** 关闭后回调。 */
    afterClose?: () => void;
    /** 显隐（受控透传外壳）。 */
    open?: boolean;
    /** 标题（透传外壳）。 */
    title?: string;
    /** 宽度（透传外壳）。 */
    width?: number | string;
    /** popup 抽屉位置（仅 mode=popup）。 */
    placement?: 'left' | 'right' | 'top' | 'bottom';
    /** 显隐意图变化（受控，需外部回写 open）。 */
    onOpenChange?: (open: boolean) => void;
    /** emoji 类型的 emoji 序列，默认 5 档满意度表情。 */
    emojis?: string[];
    class?: string;
  }

  let {
    mode = 'modal',
    type = 'text',
    value,
    onValueChange,
    options,
    textAreaProps,
    renderContent,
    content,
    onOk,
    onCancel,
    afterClose,
    open,
    title,
    width,
    placement = 'right',
    onOpenChange,
    emojis,
    class: className,
  }: Props = $props();

  const loc = useLocale();

  // —— value 归一化（内联；spec §3）——
  // 各 type 读写对应形态；渲染层只读派生，写值统一走 setValue（红线 #2）。
  const emojiValue = $derived(
    type === 'emoji' && value && typeof value === 'object' && !Array.isArray(value)
      ? (value as EmojiResult)
      : ({} as EmojiResult),
  );
  const textValue = $derived(typeof value === 'string' ? value : (emojiValue.text ?? ''));
  const radioValue = $derived(typeof value === 'string' ? value : undefined);
  const checkboxValue = $derived(Array.isArray(value) ? (value as string[]) : []);

  function setValue(next: FeedbackValue) {
    onValueChange?.(next);
  }

  // —— emoji 表情行：自建 role=radiogroup（对齐 Rating 键盘范式）——
  const DEFAULT_EMOJIS = ['😠', '🙁', '😐', '🙂', '😍'];
  const emojiList = $derived(emojis ?? DEFAULT_EMOJIS);
  const emojiLabels = $derived([
    loc().t('Feedback.emojiVeryBad'),
    loc().t('Feedback.emojiBad'),
    loc().t('Feedback.emojiNeutral'),
    loc().t('Feedback.emojiGood'),
    loc().t('Feedback.emojiVeryGood'),
  ]);

  function emojiLabelFor(index: number): string {
    // 默认 5 档语义映射；自定义 emoji 数量不同时按比例落到 5 档，兜底为序号。
    if (emojiList.length === 5) return emojiLabels[index] ?? `${index + 1}`;
    const ratio = emojiList.length > 1 ? index / (emojiList.length - 1) : 0;
    const bucket = Math.round(ratio * 4);
    return emojiLabels[bucket] ?? `${index + 1}`;
  }

  const selectedEmojiIndex = $derived(
    emojiValue.emoji ? emojiList.indexOf(emojiValue.emoji) : -1,
  );

  function selectEmoji(index: number) {
    const emoji = emojiList[index];
    if (emoji === undefined) return;
    setValue({ emoji, ...(emojiValue.text !== undefined ? { text: emojiValue.text } : {}) });
  }

  function onEmojiKeydown(e: KeyboardEvent) {
    const count = emojiList.length;
    if (count === 0) return;
    const cur = selectedEmojiIndex;
    let next = cur;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = cur < 0 ? 0 : Math.min(count - 1, cur + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = cur < 0 ? count - 1 : Math.max(0, cur - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next !== cur) selectEmoji(next);
  }

  // roving tabindex：选中项可聚焦；未选中时首项可聚焦。
  function emojiTabIndex(index: number): number {
    if (selectedEmojiIndex < 0) return index === 0 ? 0 : -1;
    return index === selectedEmojiIndex ? 0 : -1;
  }

  // —— 提交 loading（onOk 异步）——
  let submitting = $state(false);

  async function handleOk(): Promise<void> {
    if (!onOk) return;
    const result = onOk({ value });
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      submitting = true;
      try {
        await result;
      } finally {
        submitting = false;
      }
    }
  }

  function handleCancel(): void {
    onCancel?.();
  }

  const ctx = $derived<FeedbackContentContext>({ value, setValue });
  const bodySnippet = $derived(renderContent ?? content);

  const submitText = $derived(loc().t('Feedback.submit'));
  const cancelText = $derived(loc().t('Feedback.cancel'));
  const placeholder = $derived(loc().t('Feedback.placeholder'));
  const ratingLabel = $derived(loc().t('Feedback.ratingLabel'));
</script>

<!-- 反馈内容区：按 type 分发。惰性由外壳 destroyOnClose / lazy 控制。 -->
{#snippet body()}
  <div class="cd-feedback__body">
    {#if bodySnippet}
      {@render bodySnippet(ctx)}
    {:else if type === 'text'}
      <TextArea
        value={textValue}
        {placeholder}
        onChange={(v) => setValue(v)}
        {...textAreaProps ?? {}}
      />
    {:else if type === 'emoji'}
      <div
        class="cd-feedback__emoji-group"
        role="radiogroup"
        tabindex={-1}
        aria-label={ratingLabel}
        onkeydown={onEmojiKeydown}
      >
        {#each emojiList as emoji, i (i)}
          <button
            type="button"
            class="cd-feedback__emoji"
            class:cd-feedback__emoji--active={i === selectedEmojiIndex}
            role="radio"
            aria-checked={i === selectedEmojiIndex}
            aria-label={emojiLabelFor(i)}
            tabindex={emojiTabIndex(i)}
            onclick={() => selectEmoji(i)}
          >
            <span aria-hidden="true">{emoji}</span>
          </button>
        {/each}
      </div>
    {:else if type === 'radio'}
      <RadioGroup
        direction="vertical"
        options={options ?? []}
        onChange={(v) => setValue(String(v))}
        {...radioValue !== undefined ? { value: radioValue } : {}}
      />
    {:else if type === 'checkbox'}
      <CheckboxGroup
        direction="vertical"
        options={options ?? []}
        value={checkboxValue}
        onChange={(v) => setValue(v as string[])}
      />
    {/if}
  </div>
{/snippet}

{#if mode === 'popup'}
  <SideSheet
    {placement}
    onCancel={handleCancel}
    {...afterClose ? { onAfterClose: afterClose } : {}}
    {...open !== undefined ? { open } : {}}
    {...title !== undefined ? { title } : {}}
    {...width !== undefined ? { width } : {}}
    {...onOpenChange ? { onOpenChange: (e: { open: boolean }) => onOpenChange(e.open) } : {}}
    {...className ? { class: className } : {}}
  >
    {@render body()}
    {#snippet footer({ close })}
      <button type="button" class="cd-feedback__btn cd-feedback__btn--text" onclick={() => { handleCancel(); close(); }}>
        {cancelText}
      </button>
      <button
        type="button"
        class="cd-feedback__btn cd-feedback__btn--primary"
        aria-busy={submitting}
        disabled={submitting}
        onclick={async () => { await handleOk(); }}
      >
        {submitText}
      </button>
    {/snippet}
  </SideSheet>
{:else}
  <Modal
    okText={submitText}
    cancelText={cancelText}
    confirmLoading={submitting}
    onOk={handleOk}
    onCancel={handleCancel}
    {...afterClose ? { onAfterClose: afterClose } : {}}
    {...open !== undefined ? { open } : {}}
    {...title !== undefined ? { title } : {}}
    {...width !== undefined ? { width } : {}}
    {...onOpenChange ? { onOpenChange } : {}}
    {...className ? { class: className } : {}}
  >
    {@render body()}
  </Modal>
{/if}

<style>
  .cd-feedback__body {
    display: flex;
    flex-direction: column;
    gap: var(--cd-feedback-content-gap);
  }
  .cd-feedback__emoji-group {
    display: flex;
    gap: var(--cd-feedback-emoji-gap);
    align-items: center;
  }
  .cd-feedback__emoji {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    font-size: var(--cd-feedback-emoji-size);
    line-height: 1;
    cursor: pointer;
    border-radius: var(--cd-border-radius-small);
    transition: transform var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-feedback__emoji:hover {
    transform: scale(var(--cd-feedback-emoji-active-scale));
  }
  .cd-feedback__emoji--active {
    transform: scale(var(--cd-feedback-emoji-active-scale));
  }
  .cd-feedback__emoji:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  /* popup 形态自绘底部按钮（SideSheet footer 不含默认按钮） */
  .cd-feedback__btn {
    padding: 6px 16px;
    border-radius: var(--cd-border-radius-medium);
    border: 1px solid var(--cd-color-border);
    background: var(--cd-color-bg-2);
    color: var(--cd-color-text-0);
    cursor: pointer;
    font-size: var(--cd-font-size-body);
  }
  .cd-feedback__btn--primary {
    border-color: transparent;
    background: var(--cd-color-primary);
    color: var(--cd-color-white);
  }
  .cd-feedback__btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-feedback__btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-feedback__emoji {
      transition: none;
    }
  }
</style>
