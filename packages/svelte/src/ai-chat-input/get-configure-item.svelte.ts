/**
 * getConfigureItem — Svelte 版 HOC，1:1 对齐 Semi
 * aiChatInput/configure/getConfigureItem.tsx（React 函数式 HOC）。
 *
 * Semi 用它生成 Configure.Button/Select/RadioButton 三个内部组件，也单独具名导出
 * 给用户接入自定义受控组件（如 demo 里 `getConfigureItem(Cascader, {...})`）。
 * 本库 Configure.Select/Button/RadioButton/Mcp 各自手写（渲染细节各不相同，逐条对齐
 * 更清楚），但工厂函数本身作为公开 API 单独对齐——用户可以用它包装任意组件。
 *
 * Svelte 5 组件本质是 `(internals, props) => Exports` 的函数（编译器把
 * `<Dynamic {...props} />` 编译为直接函数调用），因此可以像 React 一样写一个
 * “函数进、函数出”的运行时工厂：返回的 Wrapped 函数把 internals 原样转发给
 * 内层真实组件，自己只负责合并 props——这与 React HOC 是同构的。
 *
 * 与 Semi 的差异只在于事件模型（Svelte 无 React 那种 useEffect 生命周期，改用
 * $effect）：字段初始值注册与卸载清理时机一致（挂载时注册 initValue，卸载时
 * removeField），其余合并逻辑逐条对应。
 */
import type { Component, ComponentInternals } from 'svelte';
import { untrack } from 'svelte';
import { getConfigureContext } from './configure-context.js';

export interface GetConfigureItemOptions<P extends Record<string, unknown>> {
  /** 内层组件读取当前值用的 prop 名（对齐 Semi valueKey，默认 'value'）。 */
  valueKey?: keyof P & string;
  /** 内层组件变更时调用的回调 prop 名（对齐 Semi onKeyChangeFnName，默认 'onChange'）。 */
  onKeyChangeFnName?: string;
  /** 内层组件 onChange 回调参数里取值的路径（对齐 Semi valuePath，如 'target.value'）。 */
  valuePath?: string;
  /** 追加类名（与调用方传入的 class 合并，对齐 Semi opts.className）。 */
  className?: string;
  /** 内层组件默认 props（对齐 Semi opts.defaultProps，优先级低于调用方 rest）。 */
  defaultProps?: Partial<P>;
}

interface ConfigureItemProps<P extends Record<string, unknown>> {
  /** 绑定的配置字段名。 */
  field: string;
  /** 初始值（挂载时注册到配置区，不触发 onConfigureChange）。 */
  initValue?: unknown;
  /** 附加变更回调（在写回 context 之外，额外通知）。 */
  onChange?: ((value: unknown) => void) | undefined;
  /** 附加类名（与 opts.className 合并）。 */
  class?: string;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

/**
 * 把任意受控组件接入 AIChatInput 配置区 context（对齐 Semi getConfigureItem）。
 * @param Inner 任意 Svelte 组件（受控：接收 opts.valueKey prop + opts.onKeyChangeFnName 回调）。
 * @param opts 见 {@link GetConfigureItemOptions}。
 * @returns 新组件：多接受 field/initValue/onChange/class 四个 props，其余透传给 Inner。
 */
export function getConfigureItem<P extends Record<string, unknown>>(
  Inner: Component<P, Record<string, unknown>, string>,
  opts: GetConfigureItemOptions<P> = {},
): Component<P & ConfigureItemProps<P>, Record<string, unknown>, string> {
  const {
    valueKey = 'value' as keyof P & string,
    onKeyChangeFnName = 'onChange',
    valuePath,
    className: optsClassName,
    defaultProps = {},
  } = opts;

  function ConfigureItem(
    this: void,
    internals: ComponentInternals,
    props: P & ConfigureItemProps<P>,
  ) {
    const ctx = getConfigureContext();

    // 挂载时注册 initValue（不触发 onConfigureChange），卸载时移除该字段
    // （对齐 Semi getConfigureItem 的 useEffect(() => {...}, [])）。
    // untrack：切断对 configureValue 的追踪，避免 setField 写主组件 state →
    // 触发重渲染 → effect 重跑 → 再次 setField 的自循环（同 AIChatInputConfigureButton 等）。
    $effect(() => {
      untrack(() => {
        const field = props.field;
        const init = props.initValue;
        if (init !== undefined) ctx?.setField({ [field]: init }, true);
      });
      return () => untrack(() => ctx?.removeField(props.field));
    });

    const onItemChange = (value: unknown): void => {
      const valueResult = valuePath ? getByPath(value, valuePath) : value;
      ctx?.setField({ [props.field]: valueResult });
      props.onChange?.(valueResult);
    };

    // 不能把合并结果算成一次性快照再传给 Inner——Svelte 的响应式要求 props 在
    // *读取时* 求值（真实组件调用时，编译器给每个 prop 生成 getter，见
    // svelte/internal/client/reactivity/props.js）。这里手写等价的 getter 对象：
    // rest（用户传入，排除 field/initValue/onChange/class 四个私有 prop）与
    // defaultProps 静态展开一次即可（它们本就不是响应式来源），但 class 和
    // value（写回值）必须各自是 getter，否则外部 context 变化不会反映到 Inner。
    const merged = {
      ...defaultProps,
      get class() {
        const cls = props.class;
        return [optsClassName, cls].filter(Boolean).join(' ') || undefined;
      },
      get [valueKey]() {
        return ctx?.getValue()[props.field];
      },
      get [onKeyChangeFnName]() {
        return onItemChange;
      },
    } as unknown as P;
    // rest：把 props 除四个私有字段外的其余部分也做成透传 getter（field/initValue/
    // onChange/class 已被上面接管或从不透传）。
    for (const key of Object.keys(props)) {
      if (key === 'field' || key === 'initValue' || key === 'onChange' || key === 'class') continue;
      if (key === valueKey || key === onKeyChangeFnName) continue;
      Object.defineProperty(merged, key, {
        enumerable: true,
        get: () => (props as Record<string, unknown>)[key],
      });
    }

    return (Inner as unknown as (i: ComponentInternals, p: P) => unknown)(internals, merged);
  }

  return ConfigureItem as unknown as Component<
    P & ConfigureItemProps<P>,
    Record<string, unknown>,
    string
  >;
}
