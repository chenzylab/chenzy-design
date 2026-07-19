<!--
  HotKeys — 严格对齐 Semi Design hotKeys。声明一组键盘快捷键组合，绑定 keydown 监听
  （默认全局 document.body，可局部），命中触发 onHotKey，并渲染可见键位提示。
  匹配引擎 / 校验 / 平台侦测全部委托 @chenzy-design/core（匹配用 event.code 物理键位，
  规避输入法/大小写，保留 Semi 优秀设计）。DOM 对齐 Semi：div.cd-hotKeys > span > span.-content
  + span.-split "+"（用 span 非 kbd，无 aria-keyshortcuts，无 rtl 特殊处理）。
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
    /** 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键。**死 prop**：严格对齐 Semi，声明但不生效（Meta/Ctrl 仍严格区分）。 */
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

  const cls = $derived(['cd-hotKeys', className].filter(Boolean).join(' '));

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
    <!-- DOM 对齐 Semi：div.cd-hotKeys > span(每键) > span.-content；分隔 span.-split "+"。 -->
    <div class={cls} {style}>
      {#each validated as key, i (i)}
        {@const item = content?.[i]}
        <span>
          {#if i > 0}<span class="cd-hotKeys-split">+</span>{/if}
          {#if item !== undefined && typeof item !== 'string'}
            <span class="cd-hotKeys-content">{@render item()}</span>
          {:else}
            <span class="cd-hotKeys-content">{item ?? displayKey(key)}</span>
          {/if}
        </span>
      {/each}
    </div>
  {/if}
{/if}

<style>
  /* 严格对齐 Semi hotKeys.scss：inline-flex 居中、user-select:none、nowrap。 */
  .cd-hotKeys {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    white-space: nowrap;
    vertical-align: bottom;
  }
  /* 键位块（对齐 Semi -content：12px/radius 2px/height 20px/padding 2px 8px/fill-0 底 text-2 字） */
  .cd-hotKeys :global(.cd-hotKeys-content) {
    font-size: var(--cd-font-size-small);
    border-radius: var(--cd-radius-hotkeys);
    height: var(--cd-height-hotkeys);
    display: inline-flex;
    align-items: center;
    padding: var(--cd-spacing-hotkeys-paddingY) var(--cd-spacing-hotkeys-paddingX);
    background: var(--cd-color-hotkeys-bg);
    color: var(--cd-color-hotkeys-text);
  }
  /* 分隔符（对齐 Semi -split：12px/margin 0 3px/text-0） */
  .cd-hotKeys :global(.cd-hotKeys-split) {
    font-size: var(--cd-font-size-small);
    margin: 0 3px;
    color: var(--cd-color-hotkeys-split);
  }
</style>
