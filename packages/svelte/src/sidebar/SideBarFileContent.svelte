<!--
  SideBarFileContent — 富文本预览折叠列表（P5）。对齐 Semi sideBar/widget/file.tsx FileContent：
  Collapse 折叠列表（clickHeaderToExpand=false，头部展开按钮触发全屏），每项一个 SideBarFileItem。
  Semi FileContentProps 只有 files/onExpand（+ 继承 activeKey/onChange/style/className），
  渲染每项时硬编码 editable=false、只传 content——列表恒为只读预览，编辑能力只属于独立的
  SideBarFileItem 组件，FileItemProps 上不暴露 editable/onContentChange/extensions/imgUploadProps
  （本库曾经把这些字段透传下去允许列表项可编辑，Semi 没有这个能力分支，已收紧对齐）。
  受控 activeKey（红线 #1）：不回写，仅经 onChange 通知；Collapse 内部兜底非受控。
  a11y：折叠头 aria-expanded 由 Collapse.Panel 提供；展开按钮 aria-label 走 i18n（SideBar.expand）。
  §9.3：files 遍历为纯派生，无自循环。
-->
<script lang="ts">
  import { IconFile, IconFullScreenStroked } from '@chenzy-design/icons';
  import { Collapse } from '../collapse/index.js';
  import Button from '../button/Button.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarFileItem from './SideBarFileItem.svelte';

  /** 单个富文本文件项。对齐 Semi FileItemProps（FileContent 消费的子集，恒只读）。 */
  export interface FileItemProps {
    /** 唯一标识（折叠面板 key）。 */
    key: string;
    /** 折叠头显示名。 */
    name?: string;
    /** 富文本内容（HTML）。 */
    content?: string;
  }

  interface Props {
    /** 富文本文件项列表。 */
    files?: FileItemProps[];
    /** 受控展开项 key（受控，不回写；仅经 onChange 通知）。 */
    activeKey?: string | string[];
    /** 展开态变化回调（Collapse onChange）。 */
    onChange?: (keys: string[]) => void;
    /** 点击某项展开（全屏）按钮回调，对齐 Semi onExpand(e, file, mode)。mode 固定 'file'。 */
    onExpand?: (e: MouseEvent, file: FileItemProps, mode: string) => void;
    /** 根自定义类名。 */
    class?: string;
    /** 根自定义内联样式。 */
    style?: string;
  }

  let {
    files = [],
    activeKey,
    onChange,
    onExpand,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();
  const expandLabel = $derived(loc().t('SideBar.expand'));

  function handleExpand(e: MouseEvent, file: FileItemProps): void {
    // 展开按钮在 head 内：阻止冒泡到 Collapse 头部，避免误触折叠（对齐 Semi FAQ 建议）。
    e.stopPropagation();
    onExpand?.(e, file, 'file');
  }

  // 新 Collapse onChange 为 (activeKey, e)；本组件对外仅暴露 key 列表。
  function handleChange(keys: string[]): void {
    onChange?.(keys);
  }

  // Semi widget/file.tsx:459 给 Collapse 根节点挂 `-collapse` + `-collapse-file` 两个类
  // （公共折叠样式 + file 变体），本库原来叫 -file-content，与 Semi 无对应。
  const rootCls = $derived(
    ['cd-sidebar-collapse', 'cd-sidebar-collapse-file', className].filter(Boolean).join(' '),
  );
</script>

<div class={rootCls} {style}>
  <!-- Semi widget/file.tsx clickHeaderToExpand={false}：head 内还有展开（全屏）按钮，
       整个 head 可点击会和按钮点击冲突，故只允许点折叠箭头。 -->
  <Collapse
    keepDOM
    clickHeaderToExpand={false}
    {...activeKey !== undefined ? { activeKey } : {}}
    {...onChange !== undefined ? { onChange: handleChange } : {}}
  >
    {#each files as file (file.key)}
      <Collapse.Panel itemKey={file.key}>
        {#snippet head()}
          <span class="cd-sidebar-collapse-header-content">
            <!-- 同 code：Semi 是裸 <IconFile />，无 -header-icon 包裹层。 -->
            <IconFile />
            <span class="cd-sidebar-collapse-header-text">{file.name ?? file.key}</span>
            <!-- 展开（全屏）按钮：Semi 用 Button(theme=borderless type=tertiary) + 具名
                 IconFullScreenStroked（widget/code.tsx，file 共用 CollapseHeader），
                 本库原为裸 button + 手写 svg。stopPropagation 不触发折叠（对齐 Semi FAQ）。 -->
            <Button
              class="cd-sidebar-collapse-header-expand-btn"
              theme="borderless"
              type="tertiary"
              aria-label={expandLabel}
              title={expandLabel}
              onclick={(e) => handleExpand(e, file)}
            >
              {#snippet icon()}<IconFullScreenStroked />{/snippet}
            </Button>
          </span>
        {/snippet}
        <SideBarFileItem content={file.content ?? ''} editable={false} />
      </Collapse.Panel>
    {/each}
  </Collapse>
</div>

<style>
  /* 对齐 Semi sidebar.scss:372-422（&-collapse 作用域，同 SideBarCodeContent）：
     sidebar 场景下 Collapse 独立卡片观感——每项 border+圆角+非末项 margin-bottom，
     展开时内容区顶部再叠一条 border-top；header 覆盖 padding/margin/font-weight。
     选择器把 .cd-sidebar-collapse 重复写两次提升 specificity（同 SideBarCodeContent
     注释：与 Collapse.svelte 里 .cd-collapse-item/-header 的 0,0,2,0 同分时，
     不能靠打包输出顺序决胜负）。 */
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
  /* 挂载层级对齐 Semi 真机 DOM：border-top 挂在 .collapsible-wrapper（overflow+
     height+opacity+transition-duration 那层），本库对应 .cd-collapsible-wrapper——
     之前挂到了 .cd-collapse-content-wrapper（往里数第 3 层，多了 collapse-content
     那层），层级错位但因为都叫 xxx-wrapper 容易看漏。 */
  .cd-sidebar-collapse.cd-sidebar-collapse
    :global(.cd-collapse-item-active .cd-collapsible-wrapper) {
    border-block-start: var(--cd-width-sidebar-collapse-item-content-border-top) solid
      var(--cd-color-sidebar-collapse-item-content-border-top);
  }
  /* 同 SideBarCodeContent：Semi -header-content 是 width:100% + paddingRight，
     -header-expand-btn 只覆盖 flex-shrink + icon-only 专属尺寸，其余归 Button 自身。 */
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
