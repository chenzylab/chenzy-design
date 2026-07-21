<!--
  SplitButtonGroup — 纯容器（严格对齐 Semi splitButtonGroup.tsx）。
  破坏性重写：删除自造的 items/position/onSelect/menu/Dropdown 集成，改为纯 role=group 容器。
  给首个/末个 <button> 加 cd-button-first / cd-button-last class（对齐 Semi 的 MutationObserver 方案，
  Svelte 用 action + MutationObserver 等价实现，兼容动态增删 button）。
  典型用法：内部放 Button + Dropdown(含箭头 Button)，见官方 demo。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** 分裂按钮组语义标签（root aria-label，对齐 Semi）。 */
    ariaLabel?: string;
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 分裂按钮内容（Button + Dropdown 等）。 */
    children?: Snippet;
  }

  let { ariaLabel, class: className, style, children }: Props = $props();

  // 对齐 Semi componentDidMount + MutationObserver：为首/末 button 加圆角 class。
  function splitClasses(node: HTMLElement) {
    const apply = () => {
      const buttons = node.querySelectorAll('button');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      // 先清旧标记再打新标记，避免动态增删后残留。
      node.querySelectorAll('.cd-button-first').forEach((el) => el.classList.remove('cd-button-first'));
      node.querySelectorAll('.cd-button-last').forEach((el) => el.classList.remove('cd-button-last'));
      first?.classList.add('cd-button-first');
      last?.classList.add('cd-button-last');
    };
    apply();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          (m.type === 'attributes' && m.attributeName === 'class') ||
          (m.type === 'childList' &&
            Array.from(m.addedNodes).some((n) => n.nodeName === 'BUTTON'))
        ) {
          apply();
          break;
        }
      }
    });
    observer.observe(node, { attributes: true, childList: true, subtree: true });
    return {
      destroy() {
        observer.disconnect();
      },
    };
  }
</script>

<div
  class={['cd-button-split', className].filter(Boolean).join(' ')}
  {style}
  role="group"
  aria-label={ariaLabel}
  use:splitClasses
>
  {@render children?.()}
</div>

<style>
  /* 对齐 Semi splitButtonGroup.scss。 */
  /* inline-flex 而非 inline-block：消除子元素（主按钮 + Dropdown trigger span）间的
     HTML 空白符间隙，否则主按钮 margin-right:1px 之外还会多出 ~4px 空格，间隔达 5px，
     与 Semi 的 1px 细缝不符（实测 Semi margin-right:1px、间隔 1px）。 */
  .cd-button-split {
    display: inline-flex;
    align-items: center;
  }
  .cd-button-split :global(.cd-button) {
    border-radius: 0;
    margin-right: 1px;
  }
  .cd-button-split :global(.cd-button-first) {
    border-top-left-radius: var(--cd-radius-button-splitbuttongroup-first-topleft);
    border-bottom-left-radius: var(--cd-radius-button-splitbuttongroup-first-bottomleft);
  }
  .cd-button-split :global(.cd-button-last) {
    border-top-right-radius: var(--cd-radius-button-splitbuttongroup-last-topright);
    border-bottom-right-radius: var(--cd-radius-button-splitbuttongroup-last-bottomright);
    margin-right: unset;
  }
  /* 因上面 border-radius:0 覆盖了 borderless active 背景，hover 时补回（对齐 Semi）。 */
  .cd-button-split:hover :global(.cd-button-borderless:active) {
    background-color: var(--cd-color-button-borderless-bg-active);
  }
</style>
