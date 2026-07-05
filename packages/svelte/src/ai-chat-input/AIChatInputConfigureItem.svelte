<!--
  AIChatInputConfigureItem — 通用配置字段包装（对齐 Semi getConfigureItem HOC 的 Svelte 等价）。
  把任意受控组件接入配置区 context：用 field 绑定，通过 children snippet 提供 { value, onChange }，
  用户在里面放任意受控组件（如自定义 Switch/Slider）。变更经 onChange 写回 value[field]。
  放在 AIChatInput 的 renderConfigureArea 里使用。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { getConfigureContext } from './configure-context.js';

  interface Props {
    /** 绑定的配置字段名。 */
    field: string;
    /** 初始值（注册到配置区，不触发 onConfigureChange）。 */
    initValue?: unknown;
    /** 渲染受控组件，参数提供当前 value 与 onChange 写回。 */
    children: Snippet<[{ value: unknown; onChange: (v: unknown) => void }]>;
  }

  let { field, initValue, children }: Props = $props();

  const ctx = getConfigureContext();

  // untrack：切断对 configureValue 的追踪，避免 setField → snippet 重渲染 → effect 自循环。
  $effect(() => {
    untrack(() => {
      if (initValue !== undefined) ctx?.setField({ [field]: initValue }, true);
    });
    return () => untrack(() => ctx?.removeField(field));
  });

  const value = $derived(ctx?.getValue()[field]);

  function handleChange(v: unknown): void {
    ctx?.setField({ [field]: v });
  }
</script>

{@render children({ value, onChange: handleChange })}
