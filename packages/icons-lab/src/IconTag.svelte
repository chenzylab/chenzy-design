<!-- IconTag — 具名图标，对齐 Semi IconTag（convertIcon(tag, 'tag')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { tagSvg } from './svgs.js';

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

<Icon svg={tagSvg} type="tag" {...rest} />
