<!--
  AutoComplete — 严格对齐 Semi Design（semi-ui/autoComplete）。
  输入联想 + 键盘选择。Token-driven, a11y-correct (combobox + listbox)。

  对齐 Semi 要点：
  - 触发器整个复用本库 <Input>（镜像 Semi renderInput：<div outerProps><Input {...innerProps} value/></div>）。
    Semi 无自绘 __control/__prefix/__input/__clear/__selected 套件，全部由 <Input> 承担
    （Input 自带 wrapper/prefix/insetLabel/showClear/suffix + autoFocus）。
    combobox role 与 aria-*（expanded/controls/activedescendant/autocomplete）经 Input 的 rest
    透传落到内部原生 <input class="cd-input">（本库 a11y 契约：combobox 在原生 input 上）。
  - 组件本身不做本地过滤：data 由用户按 query 准备（远程或本地皆同）。是否远程由 onSearch 存在决定。
  - 下拉列表根 class = cd-autocomplete-option-list（对齐 Semi semi-autocomplete-option-list）。
  - 选项包 cd-autocomplete-option-text 层，字符串候选经 <Highlight> 高亮命中的输入词
    （高亮 tag = cd-autocomplete-option-keyword，对齐 Semi option.tsx renderOptionContent）。
  - loading 复用本库 <Spin>，外层 cd-autocomplete-loading-wrapper（对齐 Semi renderLoading）。
  - defaultActiveFirstOption 默认 false、maxHeight 默认 300、zIndex 默认走 token（对齐 Semi defaultProps）。

  暂缓（本轮保留自绘）：
  - 下拉浮层用 use:floating（与本库 Select 同架构）承载，未包 <Popover>：Popover 的 .cd-popover 卡片
    结构/内边距面向气泡卡而非选项列表，Select 亦直接用 use:floating；保持二者一致的 -option-list 结构。
  - position 复用 tooltip/placement.ts 的 Semi 12 方位映射（Semi AutoComplete position 类型即 Tooltip
    Position，文档明确「可选值参考 Tooltip position」），不含 …Over 覆盖态（AutoComplete 无 insetInput
    覆盖场景，Semi 本身也未在此使用）。
  - 单个候选项渲染拆分至 Option.svelte（对齐 Semi index.tsx + option.tsx 两文件结构）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId, useDismiss, resolveDefault } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';
  import { floating } from '../_floating/use-floating.js';
  import Input from '../input/Input.svelte';
  import Spin from '../spin/Spin.svelte';
  import Option from './Option.svelte';
  import { getInputGroupContext } from '../input/context.js';
  import { positionToPlacement, type Position } from '../tooltip/placement.js';

  type ItemValue = string | number;
  type Item = ItemValue | ({ value: ItemValue; label?: string; disabled?: boolean } & Record<string, unknown>);
  // 归一化后保留原对象的额外字段（对齐 Semi：renderItem 拿到完整候选对象），
  // value/label/disabled 为组件内部约定字段。
  type NormalizedItem = { value: ItemValue; label: string; disabled: boolean } & Record<string, unknown>;
  type Size = 'small' | 'large' | 'default';
  type ValidateStatus = 'default' | 'warning' | 'error';

  interface Props {
    /** 受控输入值（string | number）。 */
    value?: ItemValue;
    /** 非受控初始值。 */
    defaultValue?: ItemValue;
    /** 候选数据（对齐 Semi data，由用户按 query 准备，组件不做本地过滤）。 */
    data?: Item[];
    /** 非受控初始展开。 */
    defaultOpen?: boolean;
    placeholder?: string;
    /** combobox 输入框可访问名；缺省回退到 placeholder 或 locale 默认。 */
    'aria-label'?: string;
    /** 关联外部 label 的 id（优先于 ariaLabel）。 */
    ariaLabelledby?: string;
    /** 输入框内嵌前缀标签。 */
    insetLabel?: string | Snippet;
    /** 内嵌标签 id（关联到 combobox 可访问名，对齐 Semi insetLabelId）。 */
    insetLabelId?: string;
    size?: Size;
    /** 校验状态（对齐 Semi validateStatus）。 */
    validateStatus?: ValidateStatus;
    disabled?: boolean;
    /** 打开浮层时默认高亮首个可用选项（对齐 Semi 默认 false）。 */
    defaultActiveFirstOption?: boolean;
    /** 远程搜索：输入回调（由外部更新 data）。提供即视为远程模式。 */
    onSearch?: (query: string) => void;
    /** 远程加载中（显示 Spin）。 */
    loading?: boolean;
    /** 值变化回调（对齐 Semi (value: string|number)）。 */
    onChange?: (value: ItemValue) => void;
    /** 选中候选项回调；onSelectWithObject=true 时入参为完整对象，否则为 value。 */
    onSelect?: (value: ItemValue | NormalizedItem) => void;
    /** 为 true 时 onSelect 回调入参从 value 变为完整候选对象 { value, label, disabled }（对齐 Semi）。 */
    onSelectWithObject?: boolean;
    /** 浮层显隐切换回调（对齐 Semi onDropdownVisibleChange）。 */
    onDropdownVisibleChange?: (visible: boolean) => void;
    /** 浮层宽度与触发器同宽（默认 true）。 */
    dropdownMatchSelectWidth?: boolean;
    /** 浮层挂载容器。 */
    getPopupContainer?: () => HTMLElement;
    /** 浮层 className。 */
    dropdownClassName?: string;
    /** 浮层样式。 */
    dropdownStyle?: string | Record<string, string>;
    /** 完全自定义触发器。 */
    triggerRender?: Snippet<[{ value: string; placeholder: string; disabled: boolean }]>;
    /** 自定义候选项渲染。 */
    renderItem?: Snippet<[{ item: NormalizedItem; isSelected: boolean }]>;
    /** 自定义已选项显示（仅 string，对齐 Semi renderSelectedItem）。 */
    renderSelectedItem?: Snippet<[{ item: NormalizedItem }]>;
    /** 无候选时展示内容。 */
    emptyContent?: Snippet | string;
    /** 输入框前缀。 */
    prefix?: Snippet | string;
    /** 输入框后缀。 */
    suffix?: Snippet | string;
    /** 显示清除按钮（对齐 Semi showClear）。 */
    showClear?: boolean;
    /** 自定义清除图标。 */
    clearIcon?: Snippet;
    onBlur?: (e: FocusEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onClear?: () => void;
    /** 挂载自动聚焦。 */
    autoFocus?: boolean;
    /** 浮层位置（对齐 Semi Tooltip 12 方位 position）。 */
    position?: Position;
    /** 浮层溢出视口时自动翻转到反向 placement（默认 true，对齐 Semi autoAdjustOverflow）。 */
    autoAdjustOverflow?: boolean;
    /** 透传键盘原始事件（在内部键盘逻辑之前调用）。 */
    onKeyDown?: (e: KeyboardEvent) => void;
    /** 根节点自定义 class。 */
    class?: string;
    /** 根节点自定义 style。 */
    style?: string;
    /** 浮层最大高度（number→px，string 原样），默认 300（对齐 Semi）。 */
    maxHeight?: number | string;
    /** 浮层 z-index，覆盖默认 token。 */
    zIndex?: number;
  }

  let {
    value,
    defaultValue = '',
    data: dataProp,
    defaultOpen = false,
    placeholder = '',
    'aria-label': ariaLabel,
    ariaLabelledby,
    insetLabel,
    insetLabelId,
    size: sizeProp,
    validateStatus: validateStatusProp,
    disabled: disabledProp,
    defaultActiveFirstOption: defaultActiveFirstOptionProp,
    onSearch,
    loading: loadingProp,
    onChange,
    onSelect,
    onSelectWithObject: onSelectWithObjectProp,
    onDropdownVisibleChange,
    dropdownMatchSelectWidth: dropdownMatchSelectWidthProp,
    getPopupContainer,
    dropdownClassName,
    dropdownStyle,
    triggerRender,
    renderItem,
    renderSelectedItem,
    emptyContent,
    prefix,
    suffix,
    showClear: showClearProp,
    clearIcon,
    onBlur,
    onFocus,
    onClear,
    autoFocus: autoFocusProp,
    position: positionProp,
    autoAdjustOverflow = true,
    onKeyDown,
    class: className = '',
    style = '',
    maxHeight: maxHeightProp,
    zIndex,
  }: Props = $props();
  // cdGlobal 全局默认 props（对齐 Semi semiGlobal.config.overrideDefaultProps）：
  // 优先级 = 显式传值 > cdGlobal['AutoComplete'] > 组件内置默认值。
  const position = $derived(resolveDefault(positionProp, 'AutoComplete', 'position', 'bottomLeft'));
  const data = $derived(resolveDefault(dataProp, 'AutoComplete', 'data', []));
  const showClear = $derived(resolveDefault(showClearProp, 'AutoComplete', 'showClear', false));
  const onSelectWithObject = $derived(resolveDefault(onSelectWithObjectProp, 'AutoComplete', 'onSelectWithObject', false));
  const defaultActiveFirstOption = $derived(resolveDefault(defaultActiveFirstOptionProp, 'AutoComplete', 'defaultActiveFirstOption', false));
  const dropdownMatchSelectWidth = $derived(resolveDefault(dropdownMatchSelectWidthProp, 'AutoComplete', 'dropdownMatchSelectWidth', true));
  const loading = $derived(resolveDefault(loadingProp, 'AutoComplete', 'loading', false));
  const maxHeight = $derived(resolveDefault(maxHeightProp, 'AutoComplete', 'maxHeight', 300));
  const validateStatus = $derived(resolveDefault(validateStatusProp, 'AutoComplete', 'validateStatus', 'default'));
  const autoFocus = $derived(resolveDefault(autoFocusProp, 'AutoComplete', 'autoFocus', false));

  // InputGroup 组级默认（size/disabled）：显式 prop 始终优先，否则回退组级，再回退组件默认。
  const group = getInputGroupContext();
  const size = $derived<Size>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);

  const loc = useLocale();

  const listId = useId('cd-autocomplete-list');

  // --- 受控值 (红线 #1): 不无条件回写 value，仅 onChange ---
  const isValueControlled = $derived(value !== undefined);
  let innerValue = $state<ItemValue>(getInitialValue());
  const currentValue = $derived<ItemValue>(isValueControlled ? (value ?? '') : innerValue);

  function getInitialValue(): ItemValue {
    return defaultValue;
  }
  // 输入框回显文本（number 值转字符串）。
  const displayValue = $derived(String(currentValue ?? ''));

  function setValue(next: ItemValue) {
    if (!isValueControlled) innerValue = next;
    onChange?.(next);
  }

  // --- 非受控 open (对齐 Semi：无受控 open，仅 defaultOpen + onDropdownVisibleChange) ---
  let innerOpen = $state(getInitialOpen());
  const isOpen = $derived(innerOpen);

  function getInitialOpen(): boolean {
    return defaultOpen;
  }

  function setOpen(next: boolean) {
    if (next === isOpen) return;
    innerOpen = next;
    onDropdownVisibleChange?.(next);
    if (!next) activeIndex = -1;
  }

  function normalize(it: Item): NormalizedItem {
    if (typeof it === 'string' || typeof it === 'number') {
      return { value: it, label: String(it), disabled: false };
    }
    // 保留原对象的额外字段（对齐 Semi：renderItem/renderSelectedItem 拿到完整候选对象）。
    return { ...it, value: it.value, label: it.label ?? String(it.value), disabled: it.disabled ?? false };
  }

  // 候选序列：仅归一化，不做本地过滤（对齐 Semi：data 由用户按 query 准备）。
  const options = $derived<NormalizedItem[]>(data.map(normalize));

  // --- roving 高亮 (红线 #2): activeIndex 本地 $state ---
  let activeIndex = $state(-1);

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < options.length
      ? `${listId}-opt-${activeIndex}`
      : undefined,
  );

  // 展开且（有候选 或 加载中）时才展示浮层。
  const showDropdown = $derived(isOpen && (options.length > 0 || loading));

  // 已选项：options 里找到与 currentValue 匹配的项（用于 renderSelectedItem）。
  const selectedItem = $derived(options.find((o) => o.label === displayValue) ?? null);

  // suffix 槽是否有内容（自定义 suffix 或需渲染 renderSelectedItem）——空则不传 Input，避免空 suffix 壳。
  const hasSuffixSlot = $derived(suffix != null || (!!renderSelectedItem && !!selectedItem));
  // prefix 优先、缺省回退 insetLabel（对齐 Semi prefix||insetLabel）。
  const usePrefixSlot = $derived(prefix != null);
  const useInsetLabelSlot = $derived(prefix == null && insetLabel != null);

  function firstEnabledIndex(): number {
    return options.findIndex((o) => !o.disabled);
  }

  function openWithOptions() {
    setOpen(true);
    if (defaultActiveFirstOption) activeIndex = firstEnabledIndex();
  }

  // Input.onInput 签名为 (value, e)（对齐 Semi）。
  function handleInput(next: string) {
    setValue(next);
    openWithOptions();
    // 远程：外部按 query 更新 data（受控红线 #1：仅回调，不回写）。
    onSearch?.(next);
  }

  function handleFocus(e: FocusEvent) {
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent) {
    onBlur?.(e);
  }

  function commit(opt: NormalizedItem) {
    if (opt.disabled || disabled) return;
    setValue(opt.value);
    onSelect?.(onSelectWithObject ? opt : opt.value);
    setOpen(false);
  }

  // 桥接内部 <Input showClear> 的清除：同步值 + 关下拉 + 上报 onClear（对齐 Semi onInputClear）。
  function clearAll() {
    if (disabled) return;
    setValue('');
    setOpen(false);
    onSearch?.('');
    onClear?.();
  }

  function moveActive(delta: number) {
    const len = options.length;
    if (len === 0) return;
    let next = activeIndex;
    for (let i = 0; i < len; i += 1) {
      next = (next + delta + len) % len;
      if (!options[next]?.disabled) {
        activeIndex = next;
        return;
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    onKeyDown?.(e);
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) openWithOptions();
        else moveActive(-1);
        break;
      case 'Enter':
        if (isOpen && activeIndex >= 0) {
          e.preventDefault();
          const opt = options[activeIndex];
          if (opt) commit(opt);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  // autoFocus 由内部 <Input autoFocus> 承担（对齐 Semi：Input 自带 autoFocus 能力）。

  // --- useDismiss (红线 #3): open 时绑、cleanup 解绑 ---
  let rootEl = $state<HTMLDivElement | null>(null);
  // 浮层经 use:floating portal 到 body，列入 extraTargets 避免误判 outsideClick。
  let dropdownEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !rootEl) return;
    const cleanup = useDismiss(rootEl, {
      onDismiss: () => setOpen(false),
      escape: true,
      outsideClick: true,
      extraTargets: [dropdownEl],
    });
    return cleanup;
  });

  const dropdownStyleStr = $derived.by(() => {
    if (!dropdownStyle) return '';
    if (typeof dropdownStyle === 'string') return dropdownStyle;
    return Object.entries(dropdownStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
  });

  const dropdownPlacement = $derived(positionToPlacement(position));

  // 根 wrapper class：尺寸/校验态/禁用外观全由内部 <Input> 承担，此处只留语义状态钩子 + 用户 class。
  const cls = $derived(
    [
      'cd-autocomplete',
      disabled && 'cd-autocomplete-disabled',
      isOpen && 'cd-autocomplete-open',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  // 浮层最大高度：number→px，string 原样（对齐 Semi maxHeight 默认 300；Semi style.maxHeight 是物理属性）。
  const maxHeightStyle = $derived.by(() => {
    const v = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    return `max-height: ${v}`;
  });

  const zIndexStyle = $derived(zIndex === undefined ? '' : `z-index: ${zIndex}`);

  // combobox 输入框可访问名：ariaLabelledby > ariaLabel > placeholder(非空) > locale 默认
  const inputAriaLabel = $derived(
    ariaLabelledby ? undefined : (ariaLabel || placeholder || loc().t('AutoComplete.ariaLabel')),
  );

  // insetLabel 存在且有 id 时，纳入 combobox 的 aria-labelledby。
  const resolvedLabelledby = $derived(
    [ariaLabelledby, insetLabel !== undefined && insetLabelId ? insetLabelId : undefined]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

{#snippet prefixSlot()}
  {#if typeof prefix === 'string'}{prefix}{:else if prefix}{@render prefix()}{/if}
{/snippet}

{#snippet insetLabelSlot()}
  {#if typeof insetLabel === 'string'}{insetLabel}{:else if insetLabel}{@render insetLabel()}{/if}
{/snippet}

<!-- suffix 槽：折入 renderSelectedItem（对齐 Semi：renderSelectedItem 作 Input suffix）。 -->
{#snippet suffixSlot()}
  {#if renderSelectedItem && selectedItem}
    <span class="cd-autocomplete-selected">
      {@render renderSelectedItem({ item: selectedItem })}
    </span>
  {/if}
  {#if typeof suffix === 'string'}{suffix}{:else if suffix}{@render suffix()}{/if}
{/snippet}

<div class={cls} style={style || undefined} bind:this={rootEl}>
  {#if triggerRender}
    {@render triggerRender({ value: displayValue, placeholder, disabled })}
  {:else}
    <!--
      触发器整个复用 <Input>（镜像 Semi renderInput 的 <Input {...innerProps} value/>）。
      combobox role 与 aria-* 经 Input rest 透传落到内部原生 <input class="cd-input">。
      prefix 与 insetLabel 走 Input 同一前缀槽（prefix 优先，对齐 Semi prefix||insetLabel）。
      suffix 折入 renderSelectedItem。showClear/clearIcon/autoFocus 由 Input 承担。
      可选 Snippet 槽仅在有内容时才注入（exactOptionalPropertyTypes 下不传 undefined）。
    -->
    {@const slotProps = {
      ...(usePrefixSlot ? { prefix: prefixSlot } : {}),
      ...(useInsetLabelSlot ? { insetLabel: insetLabelSlot } : {}),
      ...(hasSuffixSlot ? { suffix: suffixSlot } : {}),
      ...(clearIcon ? { clearIcon } : {}),
      ...(insetLabelId != null ? { insetLabelId } : {}),
      ...(inputAriaLabel != null ? { 'aria-label': inputAriaLabel } : {}),
      ...(resolvedLabelledby != null ? { ariaLabelledby: resolvedLabelledby } : {}),
      ...(activeOptionId != null ? { 'aria-activedescendant': activeOptionId } : {}),
    }}
    <Input
      value={displayValue}
      {size}
      {disabled}
      {placeholder}
      {autoFocus}
      {showClear}
      {validateStatus}
      {...slotProps}
      onInput={handleInput}
      onKeyDown={handleKeydown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClear={clearAll}
      role="combobox"
      aria-expanded={showDropdown}
      aria-controls={listId}
      aria-autocomplete="list"
    />
  {/if}

  {#if showDropdown && rootEl}
    <div
      bind:this={dropdownEl}
      class={['cd-autocomplete-option-list', dropdownClassName].filter(Boolean).join(' ')}
      role="listbox"
      id={listId}
      aria-busy={loading || undefined}
      use:floating={{ trigger: rootEl, placement: dropdownPlacement, offset: 4, autoAdjust: autoAdjustOverflow, padding: 8, matchWidth: dropdownMatchSelectWidth, open: showDropdown, getContainer: getPopupContainer }}
      style={[dropdownStyleStr, maxHeightStyle, zIndexStyle].filter(Boolean).join('; ')}
    >
      {#if loading}
        <div class="cd-autocomplete-loading-wrapper">
          <Spin size="small" />
        </div>
      {:else if options.length === 0}
        {#snippet defaultEmptyText()}
          {loc().t('AutoComplete.emptyText')}
        {/snippet}
        <Option
          empty
          emptyContent={typeof emptyContent === 'string' ? emptyContent : (emptyContent ?? defaultEmptyText)}
          onSelect={() => {}}
        />
      {:else}
        {#each options as opt, i (opt.value)}
          {#if renderItem}
            <Option
              value={opt.value}
              label={opt.label}
              disabled={opt.disabled}
              selected={opt.label === displayValue}
              focused={i === activeIndex}
              inputValue={displayValue}
              id={`${listId}-opt-${i}`}
              onSelect={() => commit(opt)}
              onMouseEnter={() => {
                if (!opt.disabled) activeIndex = i;
              }}
            >
              {@render renderItem({ item: opt, isSelected: opt.label === displayValue })}
            </Option>
          {:else}
            <Option
              value={opt.value}
              label={opt.label}
              disabled={opt.disabled}
              selected={opt.label === displayValue}
              focused={i === activeIndex}
              inputValue={displayValue}
              id={`${listId}-opt-${i}`}
              onSelect={() => commit(opt)}
              onMouseEnter={() => {
                if (!opt.disabled) activeIndex = i;
              }}
            />
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  /*
    根 wrapper：对齐 Semi .semi-autocomplete（cursor/display/vertical-align/box-sizing）；
    position:relative + width:100% 为 use:floating 定位锚点的本库补偿（Semi 靠 Popover trigger 处理，
    见文件头「暂缓」说明），width 用物理属性对齐 Semi 写法习惯。
  */
  .cd-autocomplete {
    cursor: text;
    display: inline-flex;
    vertical-align: middle;
    box-sizing: border-box;
    position: relative;
    width: 100%;
  }
  /* renderSelectedItem 折入 Input suffix 时的内联容器。 */
  .cd-autocomplete-selected {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  /*
    下拉列表：对齐 Semi .semi-autocomplete-option-list（overflow/定位）。
    Semi 的卡片背景/圆角/阴影由外层 <Popover> 提供；本库未包 Popover（见文件头注释），
    故在此自行补上等价视觉，使浮层呈现为卡片而非透明容器。
  */
  .cd-autocomplete-option-list {
    /* 定位由 use:floating 接管；此处只定义外观 + 滚动。 */
    z-index: var(--cd-z-popover);
    overflow-x: hidden;
    overflow-y: auto;
    padding-top: var(--cd-spacing-extra-tight);
    padding-bottom: var(--cd-spacing-extra-tight);
    background: var(--cd-color-bg-3);
    border-radius: var(--cd-border-radius-medium);
    box-shadow: var(--cd-shadow-elevated);
  }
  /* 加载区：对齐 Semi .semi-autocomplete-loading-wrapper（复用 Spin） */
  .cd-autocomplete-loading-wrapper {
    padding-top: var(--cd-autocomplete-loading-wrapper-padding-top);
    padding-bottom: var(--cd-autocomplete-loading-wrapper-padding-bottom);
    cursor: not-allowed;
    height: 20px;
  }
  .cd-autocomplete-loading-wrapper :global(.cd-spin) {
    width: 100%;
  }
</style>
