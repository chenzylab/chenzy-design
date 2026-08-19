<!--
  AvatarGroup — 横向层叠的头像组（1:1 对齐 Semi AvatarGroup）。
  子 <Avatar> 经 context 注册自身序号（等价 Semi React.Children 的可计数/可切片语义），
  maxCount 启用时序号 >= maxCount 者自身不渲染，由组统一渲染「+N」溢出头像（renderMore 可自定义）。
  组级 size/shape 经 context 强制下发给子 Avatar（对齐 Semi cloneElement）。
  overlapFrom: 'start'|'end' 控制压盖方向（对齐 Semi，枚举而非 px）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Avatar from './Avatar.svelte';
  import MoreScope from './AvatarGroupMoreScope.svelte';
  import {
    setAvatarGroupContext,
    type AvatarGroupMember,
    type AvatarShape,
    type AvatarSizeEnum,
    type AvatarOverlapFrom,
  } from './context.js';

  interface Props {
    /** 最多展示 N 个头像，其余折叠为「+M」。 */
    maxCount?: number;
    /** 组级形状，强制下发给子头像（对齐 Semi）。 */
    shape?: AvatarShape;
    /** 组级尺寸，强制下发给子头像，默认 medium（对齐 Semi）。 */
    size?: AvatarSizeEnum | number;
    /** 层叠压盖方向：start=前压后，end=后压前（对齐 Semi）。 */
    overlapFrom?: AvatarOverlapFrom;
    /** 自定义「+N」溢出头像渲染（对齐 Semi renderMore(restNumber, restAvatars)）。 */
    renderMore?: Snippet<[number, AvatarGroupMember[]]>;
    /** 头像组成员（组合式，对齐 Semi children）。 */
    children?: Snippet;
  }

  let {
    maxCount,
    shape = 'circle',
    size = 'medium',
    overlapFrom = 'start',
    renderMore,
    children,
  }: Props = $props();

  // ---------- 组合式成员注册（对齐 Semi React.Children 可计数/可切片）----------
  // 子 <Avatar> 在 init 期按挂载顺序领取序号；组据此决定谁渲染、谁被折叠进「+N」。
  // 注册表本身是 $state 数组：子项在 init 期同步 push（不在 render 期读），
  // 挂载后异步 bump 一次让派生重算。用 queueMicrotask 而非同步改 $state 是为了脱离
  // 子组件 init 期的同步调用栈，避免 effect_update_depth_exceeded；微任务在浏览器
  // paint 之前清空，同一渲染帧内完成，不会产生可感知的「+N」闪烁/抖动。
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
    getOverlapFrom: () => overlapFrom,
    register: (member: AvatarGroupMember) => {
      const index = declared.length;
      declared.push(member);
      bumpDeclared();
      return index;
    },
    isCollapsing: () => typeof maxCount === 'number' && maxCount >= 0,
    isHidden: (index: number) => typeof maxCount === 'number' && index >= maxCount,
  });

  // 折叠计算：前 maxCount 个可见，其余进「+N」溢出头像。
  const restAvatars = $derived.by<AvatarGroupMember[]>(() => {
    const n = declaredCount; // 依赖已注册成员数，成员到齐后重算
    if (typeof maxCount !== 'number' || maxCount < 0 || n <= maxCount) return [];
    return declared.slice(maxCount, n);
  });
  const restNumber = $derived(restAvatars.length);

  // 溢出头像 alt（1:1 对齐 Semi finalAlt 硬编码英文文案，非 i18n：` Number of remaining Avatars：${restNumber},${restAvatarAlt}`）。
  const moreAlt = $derived.by(() => {
    const names = restAvatars
      .map((a) => a.alt ?? '')
      .filter((s) => s.length > 0)
      .join(',');
    return ` Number of remaining Avatars：${restNumber},${names}`;
  });
</script>

<div class="cd-avatar-group" role="list">
  {@render children?.()}
  <!-- 被隐藏的子 Avatar 自身不渲染，这里统一补「+N」溢出头像（对齐 Semi）。 -->
  {#if restNumber > 0}
    {#if renderMore}
      <!-- MoreScope 切断折叠协议：renderMore 内的 <Avatar> 不应被判定为需折叠 -->
      <MoreScope>
        {#snippet children()}
          {@render renderMore(restNumber, restAvatars)}
        {/snippet}
      </MoreScope>
    {:else}
      <Avatar
        class="cd-avatar-item-more cd-avatar-item-{overlapFrom === 'end' ? 'end' : 'start'}-{maxCount}"
        alt={moreAlt}
        >{`+${restNumber}`}</Avatar
      >
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
  /* 用直接子代选择器（非后代 :first-child）：renderMore 场景下 more 头像被
     Popover/Tooltip 包一层 wrapper span，若用后代 :first-child 会误命中
     wrapper 内「唯一子元素」的 Avatar，把它的层叠 margin-left 意外清零
     （Semi 用 cloneElement 直接注入事件到 Avatar 自身、无 wrapper，不会有此问题；
     本库 Tooltip/Popover 固定包 wrapper span，故用直接子代选择器规避）。 */
  .cd-avatar-group > :global(.cd-avatar:first-child) {
    margin-left: 0;
  }
  /* 各档描边 + 层叠 marginLeft（直接挂在 Avatar 根节点，对齐 Semi cloneElement 合并 className，无中间 wrapper） */
  .cd-avatar-group :global(.cd-avatar-extra-extra-small) {
    border: var(--cd-avatar-group-extra-extra-small-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-extra-extra-small-margin);
  }
  .cd-avatar-group :global(.cd-avatar-extra-small) {
    border: var(--cd-avatar-group-extra-small-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-extra-small-margin);
  }
  .cd-avatar-group :global(.cd-avatar-small) {
    border: var(--cd-avatar-group-small-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-small-margin);
  }
  .cd-avatar-group :global(.cd-avatar-default) {
    border: var(--cd-avatar-group-default-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-default-margin);
  }
  .cd-avatar-group :global(.cd-avatar-medium) {
    border: var(--cd-avatar-group-medium-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-medium-margin);
  }
  .cd-avatar-group :global(.cd-avatar-large) {
    border: var(--cd-avatar-group-large-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-large-margin);
  }
  .cd-avatar-group :global(.cd-avatar-extra-large) {
    border: var(--cd-avatar-group-extra-large-border) solid var(--cd-avatar-border);
    margin-left: var(--cd-avatar-group-extra-large-margin);
  }
  /* 层叠 z-index（1:1 对齐 Semi @for 0 through 20 生成的 item-start-N/item-end-N） */
  .cd-avatar-group :global(.cd-avatar-item-start-0) { z-index: 100; }
  .cd-avatar-group :global(.cd-avatar-item-start-1) { z-index: 99; }
  .cd-avatar-group :global(.cd-avatar-item-start-2) { z-index: 98; }
  .cd-avatar-group :global(.cd-avatar-item-start-3) { z-index: 97; }
  .cd-avatar-group :global(.cd-avatar-item-start-4) { z-index: 96; }
  .cd-avatar-group :global(.cd-avatar-item-start-5) { z-index: 95; }
  .cd-avatar-group :global(.cd-avatar-item-start-6) { z-index: 94; }
  .cd-avatar-group :global(.cd-avatar-item-start-7) { z-index: 93; }
  .cd-avatar-group :global(.cd-avatar-item-start-8) { z-index: 92; }
  .cd-avatar-group :global(.cd-avatar-item-start-9) { z-index: 91; }
  .cd-avatar-group :global(.cd-avatar-item-start-10) { z-index: 90; }
  .cd-avatar-group :global(.cd-avatar-item-start-11) { z-index: 89; }
  .cd-avatar-group :global(.cd-avatar-item-start-12) { z-index: 88; }
  .cd-avatar-group :global(.cd-avatar-item-start-13) { z-index: 87; }
  .cd-avatar-group :global(.cd-avatar-item-start-14) { z-index: 86; }
  .cd-avatar-group :global(.cd-avatar-item-start-15) { z-index: 85; }
  .cd-avatar-group :global(.cd-avatar-item-start-16) { z-index: 84; }
  .cd-avatar-group :global(.cd-avatar-item-start-17) { z-index: 83; }
  .cd-avatar-group :global(.cd-avatar-item-start-18) { z-index: 82; }
  .cd-avatar-group :global(.cd-avatar-item-start-19) { z-index: 81; }
  .cd-avatar-group :global(.cd-avatar-item-start-20) { z-index: 80; }
  .cd-avatar-group :global(.cd-avatar-item-end-0) { z-index: 80; }
  .cd-avatar-group :global(.cd-avatar-item-end-1) { z-index: 81; }
  .cd-avatar-group :global(.cd-avatar-item-end-2) { z-index: 82; }
  .cd-avatar-group :global(.cd-avatar-item-end-3) { z-index: 83; }
  .cd-avatar-group :global(.cd-avatar-item-end-4) { z-index: 84; }
  .cd-avatar-group :global(.cd-avatar-item-end-5) { z-index: 85; }
  .cd-avatar-group :global(.cd-avatar-item-end-6) { z-index: 86; }
  .cd-avatar-group :global(.cd-avatar-item-end-7) { z-index: 87; }
  .cd-avatar-group :global(.cd-avatar-item-end-8) { z-index: 88; }
  .cd-avatar-group :global(.cd-avatar-item-end-9) { z-index: 89; }
  .cd-avatar-group :global(.cd-avatar-item-end-10) { z-index: 90; }
  .cd-avatar-group :global(.cd-avatar-item-end-11) { z-index: 91; }
  .cd-avatar-group :global(.cd-avatar-item-end-12) { z-index: 92; }
  .cd-avatar-group :global(.cd-avatar-item-end-13) { z-index: 93; }
  .cd-avatar-group :global(.cd-avatar-item-end-14) { z-index: 94; }
  .cd-avatar-group :global(.cd-avatar-item-end-15) { z-index: 95; }
  .cd-avatar-group :global(.cd-avatar-item-end-16) { z-index: 96; }
  .cd-avatar-group :global(.cd-avatar-item-end-17) { z-index: 97; }
  .cd-avatar-group :global(.cd-avatar-item-end-18) { z-index: 98; }
  .cd-avatar-group :global(.cd-avatar-item-end-19) { z-index: 99; }
  .cd-avatar-group :global(.cd-avatar-item-end-20) { z-index: 100; }
  /* 溢出「+N」头像背景（对齐 Semi item-more；双类压过单色类） */
  .cd-avatar-group :global(.cd-avatar.cd-avatar-item-more) {
    background-color: var(--cd-avatar-more-bg);
    color: var(--cd-avatar-palette-text);
  }
  /* RTL 层叠镜像（1:1 对齐 Semi avatar/rtl.scss：左右外边距互换） */
  :global(.cd-rtl) .cd-avatar-group {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar) {
    margin-left: auto;
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-extra-extra-small) {
    margin-right: var(--cd-avatar-group-extra-extra-small-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-extra-small) {
    margin-right: var(--cd-avatar-group-extra-small-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-small) {
    margin-right: var(--cd-avatar-group-small-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-default) {
    margin-right: var(--cd-avatar-group-default-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-medium) {
    margin-right: var(--cd-avatar-group-medium-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-large) {
    margin-right: var(--cd-avatar-group-large-margin);
  }
  :global(.cd-rtl) .cd-avatar-group :global(.cd-avatar-extra-large) {
    margin-right: var(--cd-avatar-group-extra-large-margin);
  }
  :global(.cd-rtl) .cd-avatar-group > :global(.cd-avatar:first-child) {
    margin-left: auto;
    margin-right: 0;
  }
</style>
