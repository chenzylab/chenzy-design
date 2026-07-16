<!--
  AIChatInputConfigureSelect — 配置区下拉字段（阶段 4，对齐 Semi Configure.Select）。
  用 field 绑定到配置区 context：读 value[field] 作 Select value，变更时写回 setField({[field]: v})。
  放在 AIChatInput 的 renderConfigureArea 里使用（外层需有 AIChatInput 提供的 configure context）。
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { Select } from '../select/index.js';
  import { getConfigureContext } from './configure-context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: unknown;
    /** 下拉选项（透传给 Select）。 */
    options?: unknown[];
    /** 附加变更回调（在写回 context 之外，额外通知）。 */
    onChange?: ((value: unknown) => void) | undefined;
    /** 其余透传给 Select 的 props。 */
    [key: string]: unknown;
  }

  let { field, initValue, options, onChange, ...rest }: Props = $props();

  const ctx = getConfigureContext();

  // 注册初始值 + 卸载时清理该字段（对齐 Semi getConfigureItem 的 useEffect）。
  // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state → snippet 重渲染 → 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const value = $derived(ctx?.getValue()[field]);

  function handleChange(v: unknown): void {
    ctx?.setField({ [field]: v });
    onChange?.(v);
  }
</script>

<Select
  {...rest}
  optionList={options as never}
  value={value as never}
  onChange={handleChange as never}
/>
