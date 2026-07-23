<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { getFillColor } from './utils.js';

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

  const [primaryColor, secondColor] = $derived.by(() => getFillColor(fill, 2));
</script>

<!-- IconAISearchLevel2 — AI 多彩图标，对齐 Semi IconAISearchLevel2（convertIcon 包 Icon 基座，type='ai_search_level_2'）。fill 数组自定义多色，size/spin/rotate 由 Icon 基座承载。 -->
<Icon type="ai_search_level_2" {...rest}>
<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em" focusable="false" aria-hidden="true"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.72 1.92a3.99 3.99 0 0 1-1.8 1.8 4.28 4.28 0 0 1-.51.21.6.6 0 0 0 0 1.14 3.99 3.99 0 0 1 .5.2 3.99 3.99 0 0 1 1.81 1.81 4.4 4.4 0 0 1 .21.51.6.6 0 0 0 1.14 0 3.98 3.98 0 0 1 .2-.5 3.99 3.99 0 0 1 1.81-1.81 4.2 4.2 0 0 1 .51-.21.6.6 0 0 0 0-1.14 3.99 3.99 0 0 1-.5-.2 3.99 3.99 0 0 1-1.81-1.81 4.4 4.4 0 0 1-.21-.51.6.6 0 0 0-1.14 0 3.98 3.98 0 0 1-.2.5Zm.78 1.47c-.31.42-.69.8-1.11 1.11.42.31.8.69 1.11 1.11.31-.42.69-.8 1.11-1.11-.42-.31-.8-.69-1.11-1.11Z"
                fill={primaryColor}
            />
            <path
                d="M10 2a1 1 0 0 1 0 2 6 6 0 1 0 6 6 1 1 0 1 1 2 0 8 8 0 0 1-1.68 4.9l5.39 5.4a1 1 0 1 1-1.42 1.4l-5.39-5.38A8 8 0 1 1 10 2Z"
                fill={secondColor}
            />
        </svg>
</Icon>
