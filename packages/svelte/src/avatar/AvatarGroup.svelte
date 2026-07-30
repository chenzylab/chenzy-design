<!--
  AvatarGroup — 横向层叠的头像组（1:1 对齐 Semi AvatarGroup）。
  两种用法，**都支持 maxCount 折叠为「+N」溢出头像**（对齐 Semi）：
    1. 组合式 `children` → 子 <Avatar> 经 context 注册自身序号（等价 Semi React.Children 的
       可计数/可切片语义），序号 >= maxCount 者自身不渲染，由组统一渲染「+N」。
    2. 数据驱动 `items` → 组直接切片渲染，同款折叠。
  组级 size/shape 经 context 强制下发给子 Avatar（对齐 Semi cloneElement）。
  overlapFrom: 'start'|'end' 控制压盖方向（对齐 Semi，枚举而非 px）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Avatar from './Avatar.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import {
    setAvatarGroupContext,
    type AvatarGroupMember,
    type AvatarShape,
    type AvatarSizeEnum,
    type AvatarColor,
    type AvatarOverlapFrom,
    type AvatarBorder,
  } from './context.js';

  /** 数据驱动成员（对齐 Semi 里子 <Avatar> 的常用 props）。 */
  export interface AvatarGroupItem {
    src?: string;
    srcSet?: string;
    alt?: string;
    color?: AvatarColor;
    border?: AvatarBorder;
    /** 文字/缩写内容（等价 Semi 子 Avatar 的 children）。 */
    content?: string;
  }

  interface Props {
    /** 数据驱动成员；启用 maxCount 折叠。 */
    items?: AvatarGroupItem[];
    /** 最多展示 N 个头像，其余折叠为「+M」。 */
    maxCount?: number;
    /** 组级形状，强制下发给子头像（对齐 Semi）。 */
    shape?: AvatarShape;
    /** 组级尺寸，强制下发给子头像，默认 medium（对齐 Semi）。 */
    size?: AvatarSizeEnum | number;
    /** 层叠压盖方向：start=前压后，end=后压前（对齐 Semi）。 */
    overlapFrom?: AvatarOverlapFrom;
    /** 自定义「+N」溢出头像渲染，参数为 { restNumber, restAvatars }（对齐 Semi renderMore）。 */
    renderMore?: Snippet<[{ restNumber: number; restAvatars: AvatarGroupItem[] }]>;
    /** 不用 items 时自由传入的头像。 */
    children?: Snippet;
  }

  let {
    items,
    maxCount,
    shape = 'circle',
    size = 'medium',
    overlapFrom = 'start',
    renderMore,
    children,
  }: Props = $props();

  const loc = useLocale();

  // ---------- 组合式成员注册（对齐 Semi React.Children 可计数/可切片）----------
  // 子 <Avatar> 在 init 期按挂载顺序领取序号；组据此决定谁渲染、谁被折叠进「+N」。
  // 注册表本身是 $state 数组：子项在 init 期同步 push（不在 render 期读），
  // 挂载后异步 bump 一次让派生重算（脱离挂载 effect 同步栈，避免 effect_update_depth）。
  let declared: AvatarGroupMember[] = [];
  let declaredCount = $state(0);
  let bumpScheduled = false;
  function bumpDeclared(): void {
    if (bumpScheduled) return;
    bumpScheduled = true;
    queueMicrotask(() => {
      bumpScheduled = false;
      declaredCount = declared.length;
    });
  }

  // 组级 size/shape 经 context 强制下发（子 Avatar 里 group 值优先）+ 组合式折叠协议。
  setAvatarGroupContext({
    getShape: () => shape,
    getSize: () => size,
    register: (member: AvatarGroupMember) => {
      const index = declared.length;
      declared.push(member);
      bumpDeclared();
      return index;
    },
    isCollapsing: () => typeof maxCount === 'number' && maxCount >= 0,
    isHidden: (index: number) => typeof maxCount === 'number' && index >= maxCount,
  });

  // 折叠计算：前 maxCount 个可见，其余进 restAvatars。
  const list = $derived(items ?? []);
  const hasLimit = $derived(typeof maxCount === 'number' && maxCount >= 0);
  const visible = $derived(hasLimit ? list.slice(0, maxCount) : list);
  const restAvatars = $derived(hasLimit ? list.slice(maxCount) : []);
  const restNumber = $derived(restAvatars.length);

  // 溢出头像 alt（对齐 Semi finalAlt：剩余数 + 各成员名）。
  const restAlt = $derived(
    restAvatars
      .map((a) => a.alt ?? a.content ?? '')
      .filter((s) => s.length > 0)
      .join(','),
  );
  const moreAlt = $derived(
    `${loc().t('Avatar.moreAlt', { count: restNumber })}${restAlt ? `,${restAlt}` : ''}`,
  );

  // ---------- 组合式分支的折叠计算（与 items 分支同语义，数据源换成已注册成员）----------
  const declaredRest = $derived.by<AvatarGroupMember[]>(() => {
    const n = declaredCount; // 依赖已注册成员数，成员到齐后重算
    if (typeof maxCount !== 'number' || maxCount < 0 || n <= maxCount) return [];
    return declared.slice(maxCount, n);
  });
  const declaredRestNumber = $derived(declaredRest.length);
  const declaredMoreAlt = $derived.by(() => {
    const names = declaredRest
      .map((a) => a.alt ?? a.content ?? '')
      .filter((s) => s.length > 0)
      .join(',');
    return `${loc().t('Avatar.moreAlt', { count: declaredRestNumber })}${names ? `,${names}` : ''}`;
  });

  // 各档尺寸对应一个 group 类，CSS 里直接用对应 margin token（对齐 Semi，无中间变量/fallback）。
  const sizeIsEnum = $derived(typeof size === 'string');
  const groupSizeClass = $derived(sizeIsEnum ? `cd-avatar-group-${size}` : undefined);
</script>

<div
  class={['cd-avatar-group', groupSizeClass].filter(Boolean).join(' ')}
  role={items ? 'list' : 'group'}
  aria-label={loc().t('Avatar.groupLabel')}
>
  {#if items}
    {#each visible as item, i (i)}
      {@const { content, ...rest } = item}
      <span
        class="cd-avatar-group-item"
        role="listitem"
        style="z-index:{overlapFrom === 'start' ? 100 - i : 80 + i}"
      >
        <Avatar {...rest}>
          {#if content}{content}{/if}
        </Avatar>
      </span>
    {/each}
    {#if restNumber > 0}
      <span
        class="cd-avatar-group-item cd-avatar-group-item-more"
        role="listitem"
        style="z-index:{overlapFrom === 'start' ? 100 - visible.length : 80 + visible.length}"
      >
        {#if renderMore}
          {@render renderMore({ restNumber, restAvatars })}
        {:else}
          <Avatar class="cd-avatar-item-more" alt={moreAlt}>{`+${restNumber}`}</Avatar>
        {/if}
      </span>
    {/if}
  {:else if children}
    {@render children()}
    <!-- 组合式折叠：被隐藏的子 Avatar 自身不渲染，这里统一补「+N」溢出头像（对齐 Semi）。 -->
    {#if declaredRestNumber > 0}
      <span
        class="cd-avatar-group-item cd-avatar-group-item-more"
        style="z-index:{overlapFrom === 'start' ? 100 - (maxCount ?? 0) : 80 + (maxCount ?? 0)}"
      >
        {#if renderMore}
          {@render renderMore({ restNumber: declaredRestNumber, restAvatars: declaredRest })}
        {:else}
          <Avatar class="cd-avatar-item-more" alt={declaredMoreAlt}>
            {`+${declaredRestNumber}`}
          </Avatar>
        {/if}
      </span>
    {/if}
  {/if}
</div>

<style>
  .cd-avatar-group {
    display: inline-block;
  }
  .cd-avatar-group :global(.cd-avatar) {
    box-sizing: border-box;
  }
  .cd-avatar-group-item {
    position: relative;
    display: inline-flex;
  }
  /* 各档层叠 marginLeft（直接用对应 token，对齐 Semi，无中间变量/fallback） */
  .cd-avatar-group-extra-extra-small .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-extra-extra-small-margin);
  }
  .cd-avatar-group-extra-small .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-extra-small-margin);
  }
  .cd-avatar-group-small .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-small-margin);
  }
  .cd-avatar-group-default .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-default-margin);
  }
  .cd-avatar-group-medium .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-medium-margin);
  }
  .cd-avatar-group-large .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-large-margin);
  }
  .cd-avatar-group-extra-large .cd-avatar-group-item {
    margin-left: var(--cd-avatar-group-extra-large-margin);
  }
  .cd-avatar-group-item:first-child {
    margin-left: 0;
  }
  /* 成员描边（各档宽度，对齐 Semi）保证彼此分隔 */
  .cd-avatar-group :global(.cd-avatar-extra-extra-small) {
    border: var(--cd-avatar-group-extra-extra-small-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-extra-small) {
    border: var(--cd-avatar-group-extra-small-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-small) {
    border: var(--cd-avatar-group-small-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-default) {
    border: var(--cd-avatar-group-default-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-medium) {
    border: var(--cd-avatar-group-medium-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-large) {
    border: var(--cd-avatar-group-large-border) solid var(--cd-avatar-border);
  }
  .cd-avatar-group :global(.cd-avatar-extra-large) {
    border: var(--cd-avatar-group-extra-large-border) solid var(--cd-avatar-border);
  }
  /* 溢出「+N」头像背景（对齐 Semi item-more；双类压过单色类） */
  .cd-avatar-group :global(.cd-avatar.cd-avatar-item-more) {
    background-color: var(--cd-avatar-more-bg);
    color: var(--cd-avatar-palette-text);
  }
  /* RTL 层叠镜像（1:1 对齐 Semi avatar/rtl.scss：左右外边距互换） */
  :global([dir='rtl']) .cd-avatar-group {
    direction: rtl;
  }
  :global([dir='rtl']) .cd-avatar-group-item {
    margin-left: auto;
  }
  :global([dir='rtl']) .cd-avatar-group-extra-extra-small .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-extra-extra-small-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-extra-small .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-extra-small-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-small .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-small-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-default .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-default-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-medium .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-medium-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-large .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-large-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-extra-large .cd-avatar-group-item {
    margin-right: var(--cd-avatar-group-extra-large-margin);
  }
  :global([dir='rtl']) .cd-avatar-group-item:first-child {
    margin-left: auto;
    margin-right: 0;
  }
</style>
