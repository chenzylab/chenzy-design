<!--
  仅供 Popover.kbd.test.ts 使用：验证 trigger children 内部子元素调用 stopPropagation
  时，click 触发仍能打开浮层（对齐 Semi：click 绑在触发器元素本身，不靠外层冒泡）。
  外层再包一个记录冒泡的容器，断言 click 未连带冒泡到 Popover 之外。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import Popover from './Popover.svelte';

  let outerClicks = $state(0);
</script>

<LocaleProvider locale="en_US">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div data-testid="outer" onclick={() => (outerClicks += 1)}>
    <Popover trigger="click" title="More info" content="Card body">
      <button
        type="button"
        data-testid="more"
        onclick={(e) => e.stopPropagation()}
      >还有 1 项</button>
    </Popover>
  </div>
  <span data-testid="outer-clicks">{outerClicks}</span>
</LocaleProvider>
