<!--
  Arrow — Popover 双 path 箭头（对齐 Semi popover/Arrow.tsx 独立文件）。
  水平（top/bottom 系）与垂直（left/right 系）两套 24×8 / 8×24 SVG，
  由 `.cd-popover-wrapper[x-placement]` 选择器控制显隐 + 定位（见 Popover.svelte <style>）。
  颜色取值顺序对齐 Semi Arrow.tsx：arrowStyle.xxx → popStyle（style 内联串解析出的
  background-color/border-color）→ 缺省走 CSS class 里的 token（--cd-color-popover-arrow-*）。
-->
<script lang="ts">
  interface ArrowStyle {
    borderColor?: string;
    backgroundColor?: string;
    borderOpacity?: string | number;
  }

  interface Props {
    /** 弹出方位，决定渲染水平或垂直箭头（对齐 Semi position） */
    position?: string | undefined;
    /** 箭头颜色定制（border/bg/opacity） */
    arrowStyle?: ArrowStyle | undefined;
    /** 浮层内联样式字符串，兜底解析 background-color/border-color（对齐 Semi popStyle） */
    popStyle?: string | undefined;
  }

  let { position = '', arrowStyle, popStyle }: Props = $props();

  // popStyle 内联样式字符串解析出 background-color/border-color（对齐 Semi get(popStyle, 'backgroundColor')）。
  function parseStyleProp(css: string | undefined, prop: string): string | undefined {
    if (!css) return undefined;
    for (const decl of css.split(';')) {
      const i = decl.indexOf(':');
      if (i === -1) continue;
      const key = decl.slice(0, i).trim();
      if (key === prop) return decl.slice(i + 1).trim();
    }
    return undefined;
  }

  const isVertical = $derived(position.indexOf('top') === 0 || position.indexOf('bottom') === 0);
  // 对齐 Semi：无自定义色时不写内联 style，交给 CSS `.cd-popover-icon-arrow path:nth-child()`
  // 规则兜底 token 默认色（Semi React style 对象里 undefined 值会被跳过、不写入 DOM，
  // 等价于回落到 popover.scss 的 path:nth-child(1)/(2) 选择器；Svelte 模板插值不能留 undefined
  // 字面量，故这里改为整条 style 声明按需拼接，无值时干脆不生成该样式串）。
  const borderOpacity = $derived(arrowStyle?.borderOpacity);
  const bgColor = $derived(arrowStyle?.backgroundColor ?? parseStyleProp(popStyle, 'background-color'));
  const borderColor = $derived(arrowStyle?.borderColor ?? parseStyleProp(popStyle, 'border-color'));

  function borderPathStyle(color: string | undefined, opacity: string | number | undefined): string | undefined {
    if (color === undefined && opacity === undefined) return undefined;
    const decls: string[] = [];
    if (color !== undefined) decls.push(`fill:${color}`);
    if (opacity !== undefined) decls.push(`opacity:${opacity}`);
    return decls.join(';');
  }
  const borderStyle = $derived(borderPathStyle(borderColor, borderOpacity));
  const bgStyle = $derived(bgColor !== undefined ? `fill:${bgColor}` : undefined);
</script>

{#if isVertical}
  <svg
    class="cd-popover-icon-arrow cd-popover-icon-arrow-h"
    width="24"
    height="8"
    viewBox="0 0 24 7"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z" style={borderStyle} />
    <path d="M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z" style={bgStyle} />
  </svg>
{:else}
  <svg
    class="cd-popover-icon-arrow cd-popover-icon-arrow-v"
    width="8"
    height="24"
    viewBox="0 0 7 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M0.5 0L1.5 0C1.5 4, 3 5.5, 5 7.5S8,10 8,12S7 14.5, 5 16.5S1.5,20 1.5,24L0.5 24L0.5 0z" style={borderStyle} />
    <path d="M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z" style={bgStyle} />
  </svg>
{/if}
