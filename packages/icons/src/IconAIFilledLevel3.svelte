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

  const id = getUuidShort({ prefix: 'semi-ai-filled-level-3' });
  const [stop1, stop2, stop3, stop4] = $derived.by(() => getFillColor(fill, 4));
</script>

<!-- IconAIFilledLevel3 — AI 多彩图标，对齐 Semi IconAIFilledLevel3（convertIcon 包 Icon 基座，type='ai_filled_level_3'）。fill 数组自定义多色，size/spin/rotate 由 Icon 基座承载。 -->
<Icon type="ai_filled_level_3" {...rest}>
<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em" focusable="false" aria-hidden="true"
        >
            <path
                d="M9.68 5.45c.22-1.1 1.8-1.1 2.02 0a8.79 8.79 0 0 0 6.85 6.85c1.1.22 1.1 1.8 0 2.02a8.79 8.79 0 0 0-6.85 6.85c-.22 1.1-1.8 1.1-2.02 0a8.79 8.79 0 0 0-6.85-6.85c-1.1-.22-1.1-1.8 0-2.02a8.79 8.79 0 0 0 6.85-6.85Zm8.48-3.85c.16-.8 1.31-.8 1.48 0a3.54 3.54 0 0 0 2.76 2.76c.8.17.8 1.32 0 1.48a3.54 3.54 0 0 0-2.76 2.76c-.17.8-1.32.8-1.48 0a3.54 3.54 0 0 0-2.76-2.76c-.8-.16-.8-1.31 0-1.48a3.54 3.54 0 0 0 2.76-2.76Z"
                fill={`url(#${id})`}
            />
            <defs>
                <linearGradient
                    id={id}
                    x1="23"
                    y1="22"
                    x2="-0.488628"
                    y2="18.6969"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color={stop1} />
                    <stop offset="0.3" stop-color={stop2} />
                    <stop offset="0.6" stop-color={stop3} />
                    <stop offset="1" stop-color={stop4} />
                </linearGradient>
            </defs>
        </svg>
</Icon>
