<!-- IconIndentRight — 具名图标，对齐 Semi IconIndentRight（convertIcon(indent_right, 'indent_right')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { indentRightSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    fill?: string;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={indentRightSvg} type="indent_right" {...rest} />
