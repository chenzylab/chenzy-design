<!--
  SideBarAnnotation — 参考来源/引用溯源折叠列表（P2）。see specs/components/show/SideBar.spec.md §4/§6/§9。
  对齐 Semi annotation/index.tsx 的 Annotation：组合 SideBarContainer 浮层壳（透传全部
  Container props，title 默认走 i18n annotationTitle）+ SideBarAnnotationContent 纯内容层
  （对应 Semi Annotation.AnnotationContent 静态属性，可脱离 Container 独立使用）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarContainer from './SideBarContainer.svelte';
  import SideBarAnnotationContent from './SideBarAnnotationContent.svelte';
  import type { SideBarAnnotationGroup, SideBarAnnotationItem } from './types.js';

  interface Props {
    // —— Content props（对齐 Semi ContentProps，透传 SideBarAnnotationContent）——
    /** 分组数组：每组一个折叠面板，含 header/key/annotations。 */
    info?: SideBarAnnotationGroup[];
    /** 展开的分组 key（受控，不回写；string 或 string[]）。 */
    activeKey?: string | string[] | undefined;
    /** 展开变更回调（透传 Collapse onChange，参数为当前展开 key 数组）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某条引用回调（url 存在则先在新窗口打开来源，再触发）。 */
    onClick?: (e: Event, item: SideBarAnnotationItem) => void;
    /** 自定义单条渲染（覆盖默认 video/text 卡片）。 */
    renderItem?: Snippet<[SideBarAnnotationItem]>;

    // —— Container props（透传 SideBarContainer，Annotation 继承 Container）——
    /** 是否可见（受控，不回写；仅经 onCancel 通知）。 */
    visible?: boolean;
    /** 标题（默认走 i18n annotationTitle）。 */
    title?: string | Snippet;
    /** 关闭回调。 */
    onCancel?: (e: Event) => void;
    /** 动画结束后触发。 */
    afterVisibleChange?: (v: boolean) => void;
    /** 展开/收起动画。默认 true。 */
    motion?: boolean;
    /** 宽度可拖拽。默认 true。 */
    resizable?: boolean;
    /** 最小宽度。默认 150。 */
    minWidth?: string | number;
    /** 最大宽度。 */
    maxWidth?: string | number;
    /** 默认尺寸。 */
    defaultSize?: { width?: string | number; height?: string | number };
    /** 面板自定义类名。 */
    class?: string;
    /** 面板自定义内联样式。 */
    style?: string;
  }

  let {
    info,
    activeKey,
    onChange,
    onClick,
    renderItem,
    visible,
    title,
    onCancel,
    afterVisibleChange,
    motion,
    resizable,
    minWidth,
    maxWidth,
    defaultSize,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // 标题默认取 i18n；使用方传入则覆盖。
  const resolvedTitle = $derived<string | Snippet>(
    title ?? loc().t('SideBar.annotationTitle'),
  );

  // 收集「已定义」的键值，避免 exactOptionalPropertyTypes 下把显式 undefined
  // 透传给不接受 undefined 的下游 props（SideBarContainer / SideBarAnnotationContent）。
  function definedOnly<T extends Record<string, unknown>>(
    obj: T,
  ): { [K in keyof T]?: Exclude<T[K], undefined> } {
    const out: { [K in keyof T]?: Exclude<T[K], undefined> } = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
      const v = obj[key];
      if (v !== undefined) out[key] = v as Exclude<T[typeof key], undefined>;
    }
    return out;
  }

  // 透传给 SideBarContainer 的 Container props（title 已解析默认值，故始终有值）。
  const containerProps = $derived(
    definedOnly({
      visible,
      onCancel,
      afterVisibleChange,
      motion,
      resizable,
      minWidth,
      maxWidth,
      defaultSize,
      style,
    }),
  );

  // 透传给 SideBarAnnotationContent 的内容层 props。
  const contentProps = $derived(definedOnly({ info, activeKey, onChange, onClick, renderItem }));
</script>

<SideBarContainer
  {...containerProps}
  title={resolvedTitle}
  class={['cd-sidebar-annotation', className].filter(Boolean).join(' ')}
>
  <SideBarAnnotationContent {...contentProps} />
</SideBarContainer>
