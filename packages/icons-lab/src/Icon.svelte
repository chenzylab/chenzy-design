<!--
  Icon 基座（lab）—— 严格镜像 Semi @douyinfe/semi-icons-lab `components/Icon.tsx`。
  与主图标集 Icon 基座的唯一区别：彩色图标不可改色，故无 fill prop、不设 fill: currentColor。
  DOM/尺寸档位/spin 与主集一致（font-size 驱动）。
-->
<script lang="ts">
  export type IconSize = 'inherit' | 'extra-small' | 'small' | 'default' | 'large' | 'extra-large';

  interface Props {
    svg: string;
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    type?: string;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }

  let {
    svg,
    size = 'default',
    spin = false,
    rotate,
    type,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

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
    [Number.isSafeInteger(rotate) ? `transform:rotate(${rotate}deg)` : '', style]
      .filter(Boolean)
      .join(';'),
  );
</script>

<span class={cls} role="img" aria-label={type} style={outerStyle || undefined} {...rest}>
  <!-- 彩色 svg 来源可信（构建期具名图标常量），运行时不做净化。 -->
  {@html svg}
</span>

<style>
  /* 镜像 Semi lab icons.css：font-size 驱动尺寸；彩色图标自带色，不设 fill: currentColor。 */
  .cd-icon {
    display: inline-block;
    font-style: normal;
    line-height: 0;
    text-align: center;
    text-transform: none;
    text-rendering: optimizeLegibility;
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
