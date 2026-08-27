<!--
  SideBarCodeContent — 代码/JSON 预览折叠列表（P4）。see specs/components/show/SideBar.spec.md §4/§9。
  对齐 Semi sideBar/widget/code：Collapse 折叠列表，每项一个 CodeItem。
  CodeItem 按 isJson 分流：true → JsonViewer（value=content，JSON 语义渲染，内核动态 import）；
  false → CodeHighlight（language 语法高亮）。透传 jsonViewerProps / codeHighlightProps。
  CollapseHeader 显示图标 + name + 展开（全屏）按钮，点击展开按钮走 onExpand(e, code, mode)，
  不触发折叠（extra 槽位 stopPropagation 已在 Collapse.Panel 处理）。
  受控 activeKey（红线 #1）：不回写，仅经 onChange 通知；Collapse 内部兜底非受控态。
  a11y：折叠头 aria-expanded 由 Collapse.Panel 提供；展开按钮 aria-label 走 i18n（SideBar.expand）。
  §9.3：render 期不读 effect 写入的 $state；codes 遍历为纯派生，无自循环。
-->
<script lang="ts">
  import { IconCodeStroked, IconFullScreenStroked } from '@chenzy-design/icons';
  import { Collapse } from '../collapse/index.js';
  import Button from '../button/Button.svelte';
  import SideBarCodeItem, { type CodeItemProps } from './SideBarCodeItem.svelte';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** 代码/JSON 预览项列表。 */
    codes?: CodeItemProps[];
    /** 受控展开项 key（受控，不回写；仅经 onChange 通知）。 */
    activeKey?: string | string[];
    /** 展开态变化回调（Collapse onChange）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某项展开（全屏）按钮回调，对齐 Semi onExpand(e, code, mode)。mode 固定 'code'。 */
    onExpand?: (e: MouseEvent, code: CodeItemProps, mode: string) => void;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    codes = [],
    activeKey,
    onChange,
    onExpand,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();
  const expandLabel = $derived(loc().t('SideBar.expand'));

  function handleExpand(e: MouseEvent, code: CodeItemProps): void {
    // 展开按钮在 head 内：阻止冒泡到 Collapse 头部，避免误触折叠（对齐 Semi FAQ 建议）。
    e.stopPropagation();
    onExpand?.(e, code, 'code');
  }

  // 新 Collapse onChange 为 (activeKey, e)；本组件对外仅暴露 key 列表。
  function handleChange(keys: string[]): void {
    onChange?.(keys);
  }

  // Semi widget/code.tsx:77 给 Collapse 根节点挂 `-collapse` + `-collapse-code` 两个类
  // （公共折叠样式 + code 变体），本库原来叫 -code-content，与 Semi 无对应。
  const rootCls = $derived(
    ['cd-sidebar-collapse', 'cd-sidebar-collapse-code', className].filter(Boolean).join(' '),
  );
</script>

<div class={rootCls} {style}>
  <!-- Semi widget/code.tsx clickHeaderToExpand={false}：head 内还有展开（全屏）按钮，
       整个 head 可点击会和按钮点击冲突，故只允许点折叠箭头。 -->
  <Collapse
    keepDOM
    clickHeaderToExpand={false}
    {...activeKey !== undefined ? { activeKey } : {}}
    {...onChange !== undefined ? { onChange: handleChange } : {}}
  >
    {#each codes as code (code.key)}
      <Collapse.Panel itemKey={code.key}>
        {#snippet head()}
          <span class="cd-sidebar-collapse-header-content">
            <!-- Semi 直接把图标放在 -header-content 里，没有 -header-icon 这层包裹
                 （widget/code.tsx:62 是裸 <IconCodeStroked />）。本库原来多包一层 span
                 且画的是手写 svg，已换具名图标并去掉包裹层。 -->
            <IconCodeStroked />
            <span class="cd-sidebar-collapse-header-text">{code.name ?? code.key}</span>
            <!-- 展开（全屏）按钮：Semi 用 Button(theme=borderless type=tertiary) + 具名
                 IconFullScreenStroked（widget/code.tsx），本库原为裸 button + 手写 svg。
                 stopPropagation 不触发折叠（对齐 Semi FAQ）。 -->
            <Button
              class="cd-sidebar-collapse-header-expand-btn"
              theme="borderless"
              type="tertiary"
              aria-label={expandLabel}
              title={expandLabel}
              onclick={(e) => handleExpand(e, code)}
            >
              {#snippet icon()}<IconFullScreenStroked />{/snippet}
            </Button>
          </span>
        {/snippet}
        <!-- 单项渲染委托给 SideBarCodeItem（对齐 Semi：CodeContent 内部渲染 CodeItem），
             避免同一套 isJson 分流逻辑在两处各写一遍。 -->
        <SideBarCodeItem {code} />
      </Collapse.Panel>
    {/each}
  </Collapse>
</div>

<style>
  /* 对齐 Semi sidebar.scss:372-422（&-collapse 作用域）：sidebar 场景下 Collapse 是
     独立卡片观感——每项 border+圆角+非末项 margin-bottom，展开时内容区顶部再叠一条
     border-top；header 覆盖 padding/margin/font-weight。这套覆盖本库原来完全没做，
     Collapse 组件本身只有默认的 border-bottom 分隔线视觉。
     选择器把 .cd-sidebar-collapse 重复写两次把 specificity 提到 0,0,2,0 之上
     （实际 0,0,2,0 vs Collapse.svelte 里 .cd-collapse-item/-header 同为 0,0,2,0，
     两个组件是不同 Svelte 文件，同 specificity 时靠打包输出顺序决胜负，脆弱，
     必须让这层覆盖稳定获胜）。 */
  .cd-sidebar-collapse.cd-sidebar-collapse :global(.cd-collapse-item) {
    border: var(--cd-width-sidebar-collapse-item-border) solid
      var(--cd-color-sidebar-collapse-item-border);
    border-radius: var(--cd-radius-sidebar-collapse-item);
  }
  .cd-sidebar-collapse.cd-sidebar-collapse :global(.cd-collapse-item:not(:last-child)) {
    margin-block-end: var(--cd-sidebar-collapse-item-margin-bottom);
  }
  .cd-sidebar-collapse.cd-sidebar-collapse :global(.cd-collapse-header) {
    padding: var(--cd-sidebar-collapse-header-padding-y) var(--cd-sidebar-collapse-header-padding-x);
    margin: 0;
    font-weight: var(--cd-font-weight-regular);
  }
  /* 挂载层级对齐 Semi 真机 DOM：Semi border-top 挂在 .collapsible-wrapper（overflow+
     height+opacity+transition-duration 那层），本库对应 .cd-collapsible-wrapper——
     之前挂到了 .cd-collapse-content-wrapper（往里数第 3 层，多了 collapse-content
     那层），层级错位但因为都叫 xxx-wrapper 容易看漏。 */
  .cd-sidebar-collapse.cd-sidebar-collapse
    :global(.cd-collapse-item-active .cd-collapsible-wrapper) {
    border-block-start: var(--cd-width-sidebar-collapse-item-content-border-top) solid
      var(--cd-color-sidebar-collapse-item-content-border-top);
  }
  /* Semi sidebar.scss:424-428：&-code 变体单独覆盖内容区 padding 为 12px 0px
     （硬编码字面量，非变量引用），覆盖 Collapse 默认 content padding。
     选择器叠两个 class（根节点同时挂 cd-sidebar-collapse + cd-sidebar-collapse-code）
     把 specificity 提到 0,0,3,0，稳定压过 Collapse.svelte 里 .cd-collapse .cd-collapse-content
     的 0,0,2,0——两个组件是不同 Svelte 文件，同 specificity 时靠打包输出顺序决胜负，脆弱。 */
  .cd-sidebar-collapse.cd-sidebar-collapse-code :global(.cd-collapse-content) {
    padding: var(--cd-sidebar-collapse-code-content-padding);
  }
  /* Semi sidebar.scss:389-415：-header-content 是 width:100% + paddingRight（非 flex:1
     auto），图标继承 text-1 色；-header-expand-btn 只覆盖 flex-shrink + icon-only 专属
     尺寸（&.semi-button-with-icon-only { padding/width/height }），其余全归 Button 自身。
     本库原来在裸 button 上手造了整套视觉去模拟 Button，现在真用 Button 组件了都是多余的。 */
  .cd-sidebar-collapse-header-content {
    display: flex;
    align-items: center;
    gap: var(--cd-sidebar-collapse-header-content-gap);
    inline-size: 100%;
    padding-inline-end: var(--cd-sidebar-collapse-header-content-padding-right);
    min-inline-size: 0;
  }
  .cd-sidebar-collapse-header-content :global(.cd-icon) {
    color: var(--cd-sidebar-code-head-icon-color);
  }
  .cd-sidebar-collapse-header-text {
    flex: 1;
    overflow: hidden;
    color: var(--cd-sidebar-code-head-color);
    font-size: var(--cd-font-size-regular);
    font-weight: var(--cd-font-weight-regular);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  :global(.cd-sidebar-collapse-header-expand-btn) {
    flex-shrink: 0;
  }
  :global(.cd-sidebar-collapse-header-expand-btn.cd-button-with-icon-only) {
    padding: var(--cd-sidebar-collapse-header-expand-btn-padding);
    inline-size: var(--cd-sidebar-collapse-header-expand-btn);
    block-size: var(--cd-sidebar-collapse-header-expand-btn);
  }
</style>
