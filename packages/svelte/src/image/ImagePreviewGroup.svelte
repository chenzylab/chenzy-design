<!--
  ImagePreviewGroup — 图片预览组（复合组件 Image.PreviewGroup）。
  包裹多个 <Image preview>，共享一个预览浮层：点任一图进入组预览，可左右切换。
  红线 #3：当前索引 / 打开态以 $state 维护；浮层 portal、键盘监听在 ImagePreview 内命令式 + cleanup。
  红线 #1：current/visible 受控时不回写，仅经 onChange/onVisibleChange 回调。
  红线 #2：派生项列表为纯函数。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setImageGroupContext, type PreviewItem } from './context.js';
  import ImagePreview from './ImagePreview.svelte';

  interface Props {
    /** 受控：当前预览图索引。传入则受控，不回写，仅经 onChange 回调。 */
    current?: number;
    /** 受控：预览是否可见。 */
    visible?: boolean;
    onChange?: (index: number) => void;
    onVisibleChange?: (visible: boolean) => void;
    children?: Snippet;
  }

  let { current, visible, onChange, onVisibleChange, children }: Props = $props();

  // 已注册子图（注册顺序即索引）。槽位卸载置 null，避免索引漂移。
  let items = $state<(PreviewItem | null)[]>([]);

  // 非受控本地态。
  let innerCurrent = $state(0);
  let innerVisible = $state(false);

  const isCurrentControlled = $derived(current !== undefined);
  const isVisibleControlled = $derived(visible !== undefined);

  const activeCurrent = $derived(isCurrentControlled ? (current as number) : innerCurrent);
  const activeVisible = $derived(isVisibleControlled ? (visible as boolean) : innerVisible);

  // 派生纯函数：紧凑后的预览图列表（过滤已卸载槽位）+ 槽位索引→列表索引映射。
  const previewList = $derived(
    items
      .map((it, slot) => (it ? { src: it.getSrc(), alt: it.getAlt(), slot } : null))
      .filter((v): v is { src: string; alt: string; slot: number } => v !== null),
  );
  const images = $derived(previewList.map(({ src, alt }) => ({ src, alt })));

  function setCurrent(index: number) {
    if (!isCurrentControlled) innerCurrent = index;
    onChange?.(index);
  }
  function setVisible(next: boolean) {
    if (!isVisibleControlled) innerVisible = next;
    onVisibleChange?.(next);
  }

  setImageGroupContext({
    register(item) {
      const slot = items.length;
      items = [...items, item];
      return slot;
    },
    unregister(slot) {
      if (slot < items.length) {
        const next = items.slice();
        next[slot] = null;
        items = next;
      }
    },
    open(slot) {
      // 槽位索引 → 紧凑列表索引。
      const listIndex = previewList.findIndex((p) => p.slot === slot);
      setCurrent(listIndex < 0 ? 0 : listIndex);
      setVisible(true);
    },
  });

  function handleClose() {
    setVisible(false);
  }
  function handleChange(index: number) {
    setCurrent(index);
  }
</script>

{@render children?.()}

{#if activeVisible && images.length > 0}
  <ImagePreview
    {images}
    current={activeCurrent}
    onClose={handleClose}
    onChange={handleChange}
  />
{/if}
