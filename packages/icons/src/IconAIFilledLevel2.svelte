<script lang="ts">
  import { getFillColor } from './utils.js';

  interface Props {
    /** 多彩填充色：string 或 string[]（缺省用 Semi 默认渐变色）。 */
    fill?: string | string[];
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { fill, ...rest }: Props = $props();

  const [primaryColor, secondColor] = $derived.by(() => getFillColor(fill, 2));
</script>

<!-- IconAIFilledLevel2 — AI 多彩图标，对齐 Semi IconAIFilledLevel2（type='ai_filled_level_2'）。fill 数组自定义多色。 -->
<svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em" focusable="false" aria-hidden="true" {...rest}
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.68 5.45c.22-1.1 1.8-1.1 2.02 0a8.79 8.79 0 0 0 6.85 6.85c1.1.22 1.1 1.8 0 2.02a8.79 8.79 0 0 0-6.85 6.85c-.22 1.1-1.8 1.1-2.02 0a8.79 8.79 0 0 0-6.85-6.85c-1.1-.22-1.1-1.8 0-2.02a8.79 8.79 0 0 0 6.85-6.85Z"
                fill={secondColor}
            />
            <path
                d="M18.16 1.6c.16-.8 1.31-.8 1.48 0a3.54 3.54 0 0 0 2.76 2.76c.8.17.8 1.32 0 1.48a3.54 3.54 0 0 0-2.76 2.76c-.17.8-1.32.8-1.48 0a3.54 3.54 0 0 0-2.76-2.76c-.8-.16-.8-1.31 0-1.48a3.54 3.54 0 0 0 2.76-2.76Z"
                fill={primaryColor}
            />
        </svg>
