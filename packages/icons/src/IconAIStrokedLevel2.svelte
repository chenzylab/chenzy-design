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

<!-- IconAIStrokedLevel2 — AI 多彩图标，对齐 Semi IconAIStrokedLevel2（convertIcon 包 Icon 基座，type='ai_stroked_level_2'）。fill 数组自定义多色，size/spin/rotate 由 Icon 基座承载。 -->
<Icon type="ai_stroked_level_2" {...rest}>
<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em" focusable="false" aria-hidden="true"
        >
            <path
                d="M18.16 1.6c.16-.8 1.31-.8 1.48 0a3.54 3.54 0 0 0 2.76 2.76c.8.17.8 1.32 0 1.48a3.54 3.54 0 0 0-2.76 2.76c-.17.8-1.32.8-1.48 0a3.54 3.54 0 0 0-2.76-2.76c-.8-.16-.8-1.31 0-1.48a3.54 3.54 0 0 0 2.76-2.76Z"
                fill={primaryColor}
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.68 5.45c.22-1.1 1.8-1.1 2.02 0a8.79 8.79 0 0 0 6.85 6.85c1.1.22 1.1 1.8 0 2.02a8.79 8.79 0 0 0-6.85 6.85c-.22 1.1-1.8 1.1-2.02 0a8.79 8.79 0 0 0-6.85-6.85c-1.1-.22-1.1-1.8 0-2.02a8.79 8.79 0 0 0 6.85-6.85Zm1.01 2.96a10.73 10.73 0 0 1-4.9 4.9 10.73 10.73 0 0 1 4.9 4.9 10.73 10.73 0 0 1 4.9-4.9 10.72 10.72 0 0 1-4.9-4.9Z"
                fill={secondColor}
            />
        </svg>
</Icon>
