<!-- IconImport — 具名图标，对齐 Semi IconImport（convertIcon(import, 'import')）。 -->
<script lang="ts">
  import Icon, { type IconSize } from './Icon.svelte';
  import { importSvg } from './svgs.js';

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

<Icon svg={importSvg} type="import" {...rest} />
