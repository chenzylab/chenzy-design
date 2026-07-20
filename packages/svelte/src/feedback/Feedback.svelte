<!--
  Feedback — 用户反馈收集弹窗，严格对齐 Semi Feedback（feedback/index.tsx）。
  纯组合本库外壳 + 内容子控件：
    mode=popup（默认）→ SideSheet 外壳（bottom 抽屉，自绘 footer）；
    mode=modal        → Modal 外壳（复用 Modal 内置 footer）。
    type=emoji（默认）→ 😞😐😃 三档表情行，选 😞(bad) 时额外出可选 TextArea；
    type=text         → TextArea；radio → RadioGroup；checkbox → CheckboxGroup；
    type=custom       → children（由 renderContent 可选包裹）。
  外壳的 focus-trap / inert / Esc / 背景锁滚均由 Modal / SideSheet 内置，直接复用。
  value 归一化内联：string / string[] / EmojiResult。submit 禁用规则对齐 Semi
  （无值或空数组时禁用）；onOk/onCancel 返回 Promise 时按钮 loading。

  与 Semi 一致：radio/checkbox 选项经 radioGroupProps / checkboxGroupProps 透传，
  无自造 options；emoji 为裸 span + click（无 roving tabindex / role=radio）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Modal } from '../modal/index.js';
  import { SideSheet } from '../side-sheet/index.js';
  import { TextArea } from '../input/index.js';
  import { RadioGroup } from '../radio/index.js';
  import type { RadioChangeEvent } from '../radio/context.js';
  import { CheckboxGroup } from '../checkbox/index.js';
  import { Button } from '../button/index.js';
  import { useLocale } from '../locale-provider/index.js';

  export type FeedbackMode = 'modal' | 'popup';
  export type FeedbackType = 'text' | 'emoji' | 'radio' | 'checkbox' | 'custom';
  /** emoji 类型的反馈值：可含 emoji 选择与附加文本。 */
  export interface EmojiResult {
    emoji?: string;
    text?: string;
  }
  export type FeedbackValue = string | string[] | EmojiResult;

  interface Props {
    /** 呈现形态：popup=SideSheet 抽屉；modal=Modal 弹窗。对齐 Semi mode，默认 popup。 */
    mode?: FeedbackMode;
    /** 反馈类型。对齐 Semi type，默认 emoji。 */
    type?: FeedbackType;
    /** 反馈内容变化回调。对齐 Semi onValueChange。 */
    onValueChange?: (value: FeedbackValue) => void;
    /** 透传多行输入框参数。对齐 Semi textAreaProps。 */
    textAreaProps?: Record<string, unknown>;
    /** 透传单选组参数（含 options）。对齐 Semi radioGroupProps。 */
    radioGroupProps?: Record<string, unknown>;
    /** 透传多选组参数（含 options）。对齐 Semi checkboxGroupProps。 */
    checkboxGroupProps?: Record<string, unknown>;
    /** 自定义反馈内容展示：接收已渲染的默认内容 snippet。对齐 Semi renderContent。 */
    renderContent?: Snippet<[Snippet]>;
    /** 提交回调，返回 Promise 时 resolve 后自动关闭。对齐 Semi onOk。 */
    onOk?: (e: MouseEvent) => void | Promise<unknown>;
    /** 取消回调，返回 Promise 时 resolve 后自动关闭。对齐 Semi onCancel。 */
    onCancel?: (e: MouseEvent) => void | Promise<unknown>;
    /** 关闭后回调。对齐 Semi afterClose。 */
    afterClose?: () => void;
    /** 透传提交按钮参数。对齐 Semi okButtonProps。 */
    okButtonProps?: Record<string, unknown>;
    /** 透传取消按钮参数。对齐 Semi cancelButtonProps。 */
    cancelButtonProps?: Record<string, unknown>;
    /** type=custom 时的自定义内容。 */
    children?: Snippet;
    /** 自定义底部（透传外壳）。对齐 Semi footer：非空时替换默认双按钮。 */
    footer?: Snippet | null;
    class?: string;
    /** 其余参数透传外壳（mode=modal → ModalProps；mode=popup → SideSheetProps）。 */
    [key: string]: unknown;
  }

  let {
    mode = 'popup',
    type = 'emoji',
    onValueChange,
    textAreaProps,
    radioGroupProps,
    checkboxGroupProps,
    renderContent,
    onOk,
    onCancel,
    afterClose,
    okButtonProps,
    cancelButtonProps,
    children,
    footer,
    class: className,
    ...rest
  }: Props = $props();

  const loc = useLocale();
  const submitText = $derived(loc().t('Feedback.submit'));
  const cancelText = $derived(loc().t('Feedback.cancel'));

  // —— Emoji 表情（对齐 Semi constants.strings.Emoji）——
  const EMOJI = { bad: '😞', normal: '😐', good: '😃' } as const;
  const EMOJI_LIST = [EMOJI.bad, EMOJI.normal, EMOJI.good];

  // —— value 受控归一化（内联）——
  let value = $state<FeedbackValue | null>(null);
  const emojiResult = $derived(
    value && typeof value === 'object' && !Array.isArray(value) ? (value as EmojiResult) : ({} as EmojiResult),
  );
  const selectedEmoji = $derived(emojiResult.emoji);

  function setValue(next: FeedbackValue) {
    value = next;
    onValueChange?.(next);
  }

  // —— 各 type 变化处理（对齐 Semi foundation）——
  function handleEmojiClick(emoji: string) {
    setValue({ emoji });
  }
  function handleEmojiReasonChange(text: string) {
    (textAreaProps?.onChange as ((v: string) => void) | undefined)?.(text);
    setValue({ ...emojiResult, text });
  }
  function handleTextChange(text: string) {
    (textAreaProps?.onChange as ((v: string) => void) | undefined)?.(text);
    setValue(text);
  }
  function handleRadioChange(e: RadioChangeEvent) {
    (radioGroupProps?.onChange as ((e: RadioChangeEvent) => void) | undefined)?.(e);
    setValue(e.target.value as string);
  }
  function handleCheckboxChange(v: unknown[]) {
    (checkboxGroupProps?.onChange as ((v: unknown[]) => void) | undefined)?.(v);
    setValue(v.map(String));
  }

  // 提交禁用：无值或空数组（对齐 Semi disableSubmitButton）。
  const disableSubmit = $derived(!value || (Array.isArray(value) && value.length === 0));

  // —— 提交 / 取消 Promise 状态（对齐 Semi onOKReturnPromiseStatus）——
  let okPending = $state(false);
  let cancelPending = $state(false);

  function isPromise(v: unknown): v is Promise<unknown> {
    return !!v && typeof (v as Promise<unknown>).then === 'function';
  }

  // popup：自绘 footer 按钮，异步 loading，resolve 后清空 value（对齐 foundation.handleSubmit/handleCancel）。
  function handleSubmit(e: MouseEvent) {
    const result = onOk?.(e);
    if (isPromise(result)) {
      okPending = true;
      result.then(() => { okPending = false; value = null; }).catch((err) => { okPending = false; throw err; });
    } else {
      value = null;
    }
  }
  // SideSheet onCancel 传 MouseEvent | KeyboardEvent；onCancel 消费方按 MouseEvent 断言即可。
  function handleCancelClick(e: MouseEvent | KeyboardEvent) {
    const result = onCancel?.(e as MouseEvent);
    if (isPromise(result)) {
      cancelPending = true;
      result.then(() => { cancelPending = false; value = null; }).catch((err) => { cancelPending = false; throw err; });
    } else {
      value = null;
    }
  }

  // modal：交给 Modal 内置按钮（onOk/onCancel 无参），返回 Promise 则透传给 Modal（其自行 loading）。
  function handleModalOk() {
    const result = onOk?.(undefined as unknown as MouseEvent);
    if (isPromise(result)) return result.then(() => { value = null; });
    value = null;
  }
  function handleModalCancel() {
    const result = onCancel?.(undefined as unknown as MouseEvent);
    if (isPromise(result)) return result.then(() => { value = null; });
    value = null;
  }

  const textPlaceholder = 'Provider additional feedback';
  const reasonPlaceholder = 'Provider additional feedback(optional)';
</script>

<!-- 默认内容区：按 type 分发（renderContent 可包裹此 snippet）。 -->
{#snippet defaultContent()}
  {#if type === 'custom'}
    {@render children?.()}
  {:else if type === 'text'}
    <TextArea placeholder={textPlaceholder} onChange={handleTextChange} {...textAreaProps ?? {}} />
  {:else if type === 'emoji'}
    <div class="cd-feedback-emoji-container">
      {#each EMOJI_LIST as emoji (emoji)}
        <span
          class="cd-feedback-emoji-item"
          class:cd-feedback-emoji-item-selected={emoji === selectedEmoji}
          data-value={emoji}
          role="button"
          tabindex="0"
          onclick={() => handleEmojiClick(emoji)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEmojiClick(emoji); } }}
        >{emoji}</span>
      {/each}
    </div>
    {#if selectedEmoji === EMOJI.bad}
      <TextArea placeholder={reasonPlaceholder} onChange={handleEmojiReasonChange} {...textAreaProps ?? {}} />
    {/if}
  {:else if type === 'radio'}
    <div class="cd-feedback-radio-container">
      <RadioGroup direction="vertical" onChange={handleRadioChange} {...radioGroupProps ?? {}} />
    </div>
  {:else if type === 'checkbox'}
    <div class="cd-feedback-checkbox-container">
      <CheckboxGroup direction="vertical" onChange={handleCheckboxChange} {...checkboxGroupProps ?? {}} />
    </div>
  {/if}
{/snippet}

<!-- 内容出口：renderContent 存在则包裹默认内容，否则直接渲染。 -->
{#snippet realContent()}
  {#if renderContent}
    {@render renderContent(defaultContent)}
  {:else}
    {@render defaultContent()}
  {/if}
{/snippet}

<!-- popup 默认底部：取消(primary) + 提交(primary solid)，对齐 Semi renderFooter。 -->
{#snippet defaultFooter()}
  <div class="cd-feedback-footer">
    <Button type="primary" loading={cancelPending} onclick={handleCancelClick} {...cancelButtonProps ?? {}}>
      {cancelText}
    </Button>
    <Button type="primary" theme="solid" disabled={disableSubmit} loading={okPending} onclick={handleSubmit} {...okButtonProps ?? {}}>
      {submitText}
    </Button>
  </div>
{/snippet}

{#if mode === 'modal'}
  <Modal
    okText={submitText}
    cancelText={cancelText}
    onOk={handleModalOk}
    onCancel={handleModalCancel}
    okButtonProps={{ disabled: disableSubmit, ...(okButtonProps ?? {}) }}
    {...cancelButtonProps ? { cancelButtonProps } : {}}
    {...afterClose ? { afterClose } : {}}
    {...footer !== undefined ? { footer } : {}}
    {...'width' in rest ? {} : { width: 'var(--cd-width-feedback)' }}
    {...className ? { class: `cd-feedback cd-feedback-${type} ${className}` } : { class: `cd-feedback cd-feedback-${type}` }}
    {...rest}
  >
    {@render realContent()}
  </Modal>
{:else}
  <SideSheet
    mask={false}
    disableScroll={false}
    placement="bottom"
    height="auto"
    onCancel={handleCancelClick}
    footer={footer ?? defaultFooter}
    {...className ? { class: `cd-feedback cd-feedback-${type} ${className}` } : { class: `cd-feedback cd-feedback-${type}` }}
    {...rest}
  >
    {@render realContent()}
  </SideSheet>
{/if}

<style>
  /* emoji 表情行（对齐 Semi .feedback-emoji-container / -emoji-item） */
  :global(.cd-feedback-emoji-container) {
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: var(--cd-spacing-feedback-emoji-container-column-gap);
    align-self: stretch;
    margin-top: var(--cd-spacing-feedback-emoji-container-margin-y);
    margin-bottom: var(--cd-spacing-feedback-emoji-container-margin-y);
  }
  :global(.cd-feedback-emoji-item) {
    user-select: none;
    cursor: pointer;
    font-size: var(--cd-font-feedback-emoji-font-size);
    line-height: var(--cd-font-feedback-emoji-font-size);
    height: var(--cd-font-feedback-emoji-font-size);
    font-style: normal;
    filter: grayscale(100%);
  }
  :global(.cd-feedback-emoji-item:hover),
  :global(.cd-feedback-emoji-item-selected) {
    filter: none;
  }

  /* 感谢文案（对齐 Semi .feedback-thank-text，供反馈完成态复用） */
  :global(.cd-feedback-thank-text) {
    color: var(--cd-color-feedback-thank-text);
    text-align: center;
    font-size: var(--cd-font-feedback-thank-text-font-size);
    font-weight: var(--cd-font-feedback-thank-text-font-weight);
    line-height: var(--cd-font-feedback-thank-text-line-height);
    margin-top: var(--cd-spacing-feedback-thank-text-margin-top);
    margin-bottom: var(--cd-spacing-feedback-thank-text-margin-bottom);
  }

  /* 多选组行间距（对齐 Semi .feedback .checkboxGroup-vertical） */
  :global(.cd-feedback .cd-checkboxGroup-vertical) {
    row-gap: var(--cd-spacing-feedback-checkbox-group-vertical-row-gap);
  }

  /* 底部按钮行（对齐 Semi .feedback-footer） */
  :global(.cd-feedback-footer) {
    display: flex;
    justify-content: flex-end;
    column-gap: var(--cd-spacing-feedback-footer-column-gap);
  }

  /* modal 宽度：所有 type 恒 400，经 width prop 传入（Modal 内联 width 无法用 CSS 覆盖），
     对齐 Semi .feedback .modal / .feedback-text .modal（均 $width-feedback=400）。 */

  /* sidesheet 圆角、宽度与底部定位（对齐 Semi .feedback .sidesheet-inner / -size-small / -text / -bottom） */
  :global(.cd-feedback .cd-sidesheet-inner) {
    border-radius: var(--cd-radius-feedback-sidesheet-inner);
  }
  /* 提高特异性赢过 SideSheet 的 .cd-sidesheet-size-small.cd-sidesheet（同为 400/600，对齐 Semi feedback 宽度）。 */
  :global(.cd-sidesheet.cd-sidesheet-bottom.cd-feedback) {
    width: var(--cd-width-feedback);
  }
  :global(.cd-sidesheet.cd-sidesheet-bottom.cd-feedback.cd-feedback-text) {
    width: var(--cd-width-feedback-text);
  }
  :global(.cd-feedback.cd-sidesheet-bottom) {
    right: var(--cd-spacing-feedback-sidesheet-bottom-right);
    left: auto;
  }
</style>
