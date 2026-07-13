<!--
  Icon 基座 —— 严格镜像 Semi @douyinfe/semi-icons `components/Icon.tsx`。
  具名图标经 convertIcon（本库对应 createIcon）复用本基座渲染。

  DOM/props 对齐 Semi：
    <span class="cd-icon cd-icon-{size} [cd-icon-spinning] [cd-icon-{type}]"
          role="img" aria-label={type} style={rotate/fill}>{svg}</span>
  size 用 font-size 控制（extra-small=8 / small=12 / default=16 / large=20 / extra-large=24），
  内部 svg width/height=1em 随之缩放；fill: currentColor 随 CSS color 变色。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export type IconSize = 'inherit' | 'extra-small' | 'small' | 'default' | 'large' | 'extra-large';

  interface Props {
    /**
     * 图标内容，对齐 Semi svg（接收 ReactNode）：
     *  - string：SVG 字符串，内部 {@html} 渲染（具名图标常量走此路径，来源可信）；
     *  - Snippet：自定义图标片段（对标 Semi `svg={<CustomIcon />}`）。
     * 亦可用 children 传自定义图标。
     */
    svg?: string | Snippet;
    /** 尺寸档位，对齐 Semi（font-size 驱动）。 */
    size?: IconSize;
    /** 旋转动画。 */
    spin?: boolean;
    /** 旋转角度（deg）。 */
    rotate?: number;
    /** 图标语义类型，映射到 aria-label 与 cd-icon-{type} 类（对齐 Semi）。 */
    type?: string;
    /** 覆盖填充色（对齐 Semi fill；用于双色/多色图标改色）。 */
    fill?: string;
    class?: string;
    style?: string;
    /** 自定义图标片段（svg 未传时的备选插槽）。 */
    children?: Snippet;
    /** 其余原生属性（onclick / aria-* 等）透传到根 span，对齐 Semi restProps。 */
    [key: string]: unknown;
  }

  let {
    svg,
    size = 'default',
    spin = false,
    rotate,
    type,
    fill,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  const isSvgString = $derived(typeof svg === 'string');
  const svgSnippet = $derived(typeof svg === 'function' ? (svg as Snippet) : children);

  const cls = $derived(
    [
      'cd-icon',
      size && size !== 'inherit' && `cd-icon-${size}`,
      spin && 'cd-icon-spinning',
      type && `cd-icon-${type}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const outerStyle = $derived(
    [
      Number.isSafeInteger(rotate) ? `transform:rotate(${rotate}deg)` : '',
      fill ? `color:${fill}` : '',
      style,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

<span class={cls} role="img" aria-label={type} style={outerStyle || undefined} {...rest}>
  {#if isSvgString}
    <!-- svg 字符串来源可信（构建期具名图标常量），运行时不做净化。 -->
    {@html svg}
  {:else if svgSnippet}
    {@render svgSnippet()}
  {/if}
</span>

<style>
  /* 镜像 Semi icons.css：font-size 驱动尺寸，fill: currentColor 随 color 变色。 */
  .cd-icon {
    display: inline-block;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    text-rendering: optimizeLegibility;
    fill: currentColor;
  }
  .cd-icon :global(svg) {
    width: 1em;
    height: 1em;
  }
  .cd-icon-extra-small {
    font-size: 8px;
  }
  .cd-icon-small {
    font-size: 12px;
  }
  .cd-icon-default {
    font-size: 16px;
  }
  .cd-icon-large {
    font-size: 20px;
  }
  .cd-icon-extra-large {
    font-size: 24px;
  }
  .cd-icon-spinning {
    animation: 0.6s linear infinite cd-icon-animation-rotate;
    animation-fill-mode: forwards;
  }
  @keyframes cd-icon-animation-rotate {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-icon-spinning {
      animation: none;
    }
  }
</style>
