<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { getFillColor, getUuidShort } from './utils.js';

  interface Props {
    /** 多彩填充色：string 或 string[]（缺省用 Semi 默认渐变色）。 */
    fill?: string | string[];
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { fill, ...rest }: Props = $props();

  const id = getUuidShort({ prefix: 'semi-ai-loading' });
  const [stop1, stop2, stop3, stop4] = $derived.by(() => getFillColor(fill, 4));
</script>

<!-- IconAILoading — AI 多彩图标，对齐 Semi IconAILoading（convertIcon 包 Icon 基座，type='ai_loading'）。fill 数组自定义多色，size/spin/rotate 由 Icon 基座承载。 -->
<Icon type="ai_loading" {...rest}>
<svg
            viewBox="0 0 16 16" 
            width="1em"
            height="1em"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"
        >
            <path 
                d="M15.1112 7.99978C15.1112 4.07242 11.9275 0.888672 8.00009 0.888672C5.18219 0.888672 2.74711 2.52771 1.59619 4.90445" 
                stroke={`url(#${id})`} 
                stroke-width="1.77778" stroke-linecap="round"
            />
            <defs>
                <linearGradient id={id} x1="16" y1="8" x2="2.68594" y2="11.022" gradientUnits="userSpaceOnUse">
                    <stop stop-color={stop1}/>
                    <stop offset="0.3" stop-color={stop2}/>
                    <stop offset="0.6" stop-color={stop3}/>
                    <stop offset="1" stop-color={stop4} stop-opacity="0"/>
                </linearGradient>
            </defs>
        </svg>
</Icon>
