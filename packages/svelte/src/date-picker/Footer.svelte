<!--
  Footer —— 对齐 Semi datePicker/footer.tsx。
  仅 needConfirm 时渲染：cancel(borderless) + confirm(solid，disabledConfirm 时禁用)。
  复用本库 Button；文案走 locale footer.cancel/confirm。
-->
<script lang="ts">
  import Button from '../button/Button.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { cssClasses } from './constants.js';

  interface Props {
    disabledConfirm?: boolean;
    onCancelClick?: (e: MouseEvent) => void;
    onConfirmClick?: (e: MouseEvent) => void;
  }

  const noop = (): void => {};
  let {
    disabledConfirm = false,
    onCancelClick = noop,
    onConfirmClick = noop,
  }: Props = $props();

  const loc = useLocale();
  const prefixCls = cssClasses.PREFIX;
</script>

<div class={`${prefixCls}-footer`}>
  <Button theme="borderless" onclick={onCancelClick}>
    {loc().t('DatePicker.footer.cancel')}
  </Button>
  <Button theme="solid" onclick={onConfirmClick} disabled={disabledConfirm}>
    {loc().t('DatePicker.footer.confirm')}
  </Button>
</div>
