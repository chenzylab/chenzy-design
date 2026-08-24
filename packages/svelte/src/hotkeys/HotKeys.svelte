<!--
  HotKeys — 严格对齐 Semi Design hotKeys（packages/semi-ui/hotKeys/index.tsx）。声明一组
  键盘快捷键组合，绑定 keydown 监听（默认全局 document.body，可局部），命中触发 onHotKey，
  并渲染可见键位提示。匹配引擎 / 校验全部委托 @chenzy-design/core（匹配用 event.code 物理
  键位，规避输入法/大小写，Semi 原生设计）。DOM 对齐 Semi：div.cd-hotKeys > span > span.-content
  + span.-split "+"（用 span 非 kbd，无 aria-keyshortcuts，无 rtl 特殊处理，键位原样渲染
  不做大小写/平台符号转换）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isValidHotKeys, attachHotKeys, type HotKey } from '@chenzy-design/core';

  interface Props {
    /** **必填**。快捷键组合数组，恰含 1 个普通键 + 0~多修饰键。用原生 KeyboardEvent.key 或 HotKeys.Keys.*。非法抛错。 */
    hotKeys: HotKey[];
    /** 命中组合时触发，透传原生 KeyboardEvent。 */
    onHotKey?: (e: KeyboardEvent) => void;
    /** 自定义显示的键名内容（仅影响提示 UI，不改监听）。整体覆盖 hotKeys 的默认渲染（对齐 Semi `content ?? hotKeys`，非逐项 fallback）。 */
    content?: (string | Snippet)[];
    /** 完全自定义提示渲染。传 null 则不渲染任何提示 UI，仅保留监听。 */
    render?: Snippet | null;
    /** 提示 UI 根节点点击回调（对齐 Semi onClick）。 */
    onClick?: () => void;
    /** 命中时是否 preventDefault（拦截浏览器默认行为，如 Ctrl+S）。 */
    preventDefault?: boolean;
    /** 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键。**死 prop**：严格对齐 Semi，声明但不生效（Meta/Ctrl 仍严格区分）。 */
    mergeMetaCtrl?: boolean;
    /** 监听挂载节点。默认全局 document.body；返回具体元素实现局部监听。 */
    getListenerTarget?: () => HTMLElement | null;
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
    onClick,
    preventDefault = false,
    mergeMetaCtrl = false,
    getListenerTarget,
    class: className,
    style,
  }: Props = $props();

  // 校验组合合法性（非法抛错，与 core isValidHotKeys 契约一致）；派生量，hotKeys 变即重校验。
  const validated = $derived.by(() => {
    isValidHotKeys(hotKeys);
    return hotKeys;
  });

  const cls = $derived(['cd-hotKeys', className].filter(Boolean).join(' '));

  // 对齐 Semi `const renderContent = content ?? hotKeys`：content 存在时整体覆盖渲染，
  // 与 hotKeys 无逐项对应关系（长度可不同，按 renderContent 自身长度渲染）。
  const renderContent = $derived(content ?? validated);

  // —— 监听生命周期：$effect 内绑定，返回 cleanup 解绑（防泄漏，红线 #2 安全：无同步自写 state）——
  $effect(() => {
    // 读取依赖：hotKeys / preventDefault / mergeMetaCtrl / target 变化即重绑。
    const target = getListenerTarget?.() ?? (typeof document !== 'undefined' ? document.body : null);
    if (!target) return;
    const detach = attachHotKeys(target, validated, onHotKey, {
      preventDefault,
      mergeMetaCtrl,
    });
    return detach;
  });
</script>

<!-- DOM 对齐 Semi（index.tsx render）：render 分支与默认分支**同样**套根节点
     div.cd-hotKeys（承载 class/style/onClick），仅内部内容不同；render===null 整体不渲染。
     renderContent.map 原样渲染，不做大小写 / 平台符号转换，对齐 Semi renderContent.map。 -->
{#if render !== null}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class={cls} {style} onclick={onClick}>
    {#if render}
      {@render render()}
    {:else}
      {#each renderContent as item, i (i)}
        <span>
          {#if i > 0}<span class="cd-hotKeys-split">+</span>{/if}
          {#if typeof item === 'string'}
            <span class="cd-hotKeys-content">{item}</span>
          {:else}
            <span class="cd-hotKeys-content">{@render item()}</span>
          {/if}
        </span>
      {/each}
    {/if}
  </div>
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
  /* 键位块（对齐 Semi -content：12px/radius 2px/height 20px/padding 2px 8px/fill-0 底 text-2 字，
     display 不声明——保留 span 默认 inline，对齐 Semi 未设 display） */
  .cd-hotKeys :global(.cd-hotKeys-content) {
    font-size: var(--cd-font-size-small);
    border-radius: var(--cd-radius-hotkeys);
    height: var(--cd-height-hotkeys);
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
