<!-- IconTagInput — 具名图标，对齐 Semi IconTagInput（convertIcon(tag-input, 'tag-input')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tagInputSvg } from './svgs.js';

  interface Props {
    size?: IconSize;
    spin?: boolean;
    rotate?: number;
    class?: string;
    style?: string;
    [key: string]: unknown;
  }
  let { ...rest }: Props = $props();
</script>

<Icon svg={tagInputSvg} type="tag-input" {...rest} />
