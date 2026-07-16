<!--
  AIChatInputConfigureRadioButton — 配置区单选按钮组字段（阶段 4，对齐 Semi Configure.RadioButton）。
  用 field 绑定，包裹项目 RadioGroup（type='button'）。放在 renderConfigureArea 里使用。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { RadioGroup } from '../radio/index.js';
  import { getConfigureContext } from './configure-context.js';
  import type { RadioValue, RadioChangeEvent } from '../radio/context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: RadioValue;
    /** 单选项（透传给 RadioGroup）。 */
    options?: unknown[];
    /** 附加变更回调。 */
    onChange?: ((value: RadioValue) => void) | undefined;
    /** 其余透传给 RadioGroup。 */
    [key: string]: unknown;
  }

  let { field, initValue, options, onChange, ...rest }: Props = $props();

  const ctx = getConfigureContext();

  // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state → snippet 重渲染 → 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const value = $derived(ctx?.getValue()[field] as RadioValue | undefined);

  function handleChange(e: RadioChangeEvent): void {
    const v = e.target.value;
    ctx?.setField({ [field]: v });
    onChange?.(v);
  }
</script>

<RadioGroup
  {...rest}
  type="button"
  options={options as never}
  {...(value !== undefined ? { value } : {})}
  onChange={handleChange}
/>
