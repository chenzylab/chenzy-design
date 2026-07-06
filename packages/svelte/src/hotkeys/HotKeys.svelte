<!--
  HotKeys — see specs/components/other/HotKeys.spec.md
  声明一组键盘快捷键组合，绑定 keydown 监听（默认全局 document.body，可局部），命中触发 onHotKey，
  并渲染可见键位提示。匹配引擎 / 校验 / 平台侦测全部委托 @chenzy-design/core。
  a11y 增强（超越 Semi 的 span）：每个键位用语义化 <kbd> 承载，`+` 分隔符 aria-hidden，
  匹配用 event.code（物理键位，规避输入法/大小写），键位文本可选中（不设 user-select:none）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    isValidHotKeys,
    attachHotKeys,
    modifierSymbol,
    isApplePlatform,
    type HotKey,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** **必填**。快捷键组合数组，恰含 1 个普通键 + 0~多修饰键。用原生 KeyboardEvent.key 或 HotKeys.Keys.*。非法抛错。 */
    hotKeys: HotKey[];
    /** 命中组合时触发，透传原生 KeyboardEvent。 */
    onHotKey?: (e: KeyboardEvent) => void;
    /** 自定义显示的键名内容（仅影响提示 UI，不改监听）。逐项对应，未提供项回退默认渲染。 */
    content?: (string | Snippet)[];
    /** 完全自定义提示渲染。传 null 则不渲染任何提示 UI，仅保留监听。 */
    render?: Snippet | null;
    /** 命中时是否 preventDefault（拦截浏览器默认行为，如 Ctrl+S）。 */
    preventDefault?: boolean;
    /** 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键（本库真正实现，Semi 该 prop 未生效）。 */
    mergeMetaCtrl?: boolean;
    /** 监听挂载节点。默认全局 document.body；返回具体元素实现局部监听。 */
    getListenerTarget?: () => HTMLElement | null;
    /** 禁用监听（不绑定，不触发）。 */
    disabled?: boolean;
    /** 根节点类名。 */
    class?: string;
    /** 根节点内联样式。 */
    style?: string;
  }

  let {
    hotKeys,
    onHotKey,
    content,
    render,
    preventDefault = false,
    mergeMetaCtrl = false,
    getListenerTarget,
    disabled = false,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();
  const apple = isApplePlatform();

  // 校验组合合法性（非法抛错，与 core isValidHotKeys 契约一致）；派生量，hotKeys 变即重校验。
  const validated = $derived.by(() => {
    isValidHotKeys(hotKeys);
    return hotKeys;
  });

  // —— 键位显示文本：修饰键走平台符号 / i18n 文字，普通键原样（大写字母、符号） ——
  function displayKey(key: HotKey): string {
    const sym = modifierSymbol(key, apple);
    if (sym !== undefined) {
      if (apple) return sym; // Apple 平台用 ⌘⌥⌃⇧ 符号
      // 非 Apple：用 i18n 文字（Ctrl/Win/Alt/Shift），随 locale 可覆盖。
      switch (key) {
        case 'Control':
          return loc().t('HotKeys.ctrl');
        case 'Meta':
          return loc().t('HotKeys.meta');
        case 'Alt':
          return loc().t('HotKeys.alt');
        case 'Shift':
          return loc().t('HotKeys.shift');
      }
    }
    // 普通键：单字符字母显示大写；其余原样（ArrowUp / Enter / F1 等）。
    return key.length === 1 ? key.toUpperCase() : key;
  }

  const rtl = $derived(loc().direction === 'rtl');

  const cls = $derived(
    ['cd-hotkeys', rtl && 'cd-hotkeys--rtl', className].filter(Boolean).join(' '),
  );

  // aria-keyshortcuts 规范值：修饰键在前，用 '+' 连接（W3C 语法用 Control/Meta/Alt/Shift + 键名）。
  const ariaKeyshortcuts = $derived(validated.join('+'));

  // —— 监听生命周期：$effect 内绑定，返回 cleanup 解绑（防泄漏，红线 #2 安全：无同步自写 state）——
  $effect(() => {
    // 读取依赖：disabled / hotKeys / preventDefault / mergeMetaCtrl / target 变化即重绑。
    if (disabled) return;
    const target = getListenerTarget?.() ?? (typeof document !== 'undefined' ? document.body : null);
    if (!target) return;
    const detach = attachHotKeys(target, validated, onHotKey, {
      preventDefault,
      mergeMetaCtrl,
      disabled,
    });
    return detach;
  });
</script>

{#if render !== null}
  {#if render}
    {@render render()}
  {:else}
    <span class={cls} {style} aria-keyshortcuts={ariaKeyshortcuts}>
      {#each validated as key, i (i)}
        {@const item = content?.[i]}
        {#if i > 0}<span class="cd-hotkeys__split" aria-hidden="true">+</span>{/if}
        {#if item !== undefined && typeof item !== 'string'}
          <kbd class="cd-hotkeys__key">{@render item()}</kbd>
        {:else}
          <kbd class="cd-hotkeys__key">{item ?? displayKey(key)}</kbd>
        {/if}
      {/each}
    </span>
  {/if}
{/if}

<style>
  .cd-hotkeys {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-hotkeys-gap);
  }
  .cd-hotkeys--rtl {
    direction: rtl;
  }
  .cd-hotkeys__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: 1.5em;
    padding: var(--cd-hotkeys-content-padding);
    font-family: inherit;
    font-size: var(--cd-hotkeys-content-font-size);
    line-height: 1;
    color: var(--cd-hotkeys-content-color);
    background: var(--cd-hotkeys-content-bg);
    border: 1px solid var(--cd-hotkeys-content-border);
    border-radius: var(--cd-hotkeys-content-radius);
    /* 不设 user-select:none：允许用户复制键位文本（超越 Semi）。 */
  }
  .cd-hotkeys__split {
    color: var(--cd-hotkeys-split-color);
    user-select: none;
  }
</style>
