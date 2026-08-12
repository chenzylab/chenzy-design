<!--
  NodeList — 照搬 Semi Design `nodeList.tsx` 的 transitionNodes 状态机（逻辑逐行对应，
  React getDerivedStateFromProps + PureComponent state 改写为 Svelte $state + $effect）：

    getDerivedStateFromProps(props, prevState):
      比对 motionKeys / flattenNodes.keys 是否较上次变化，未变或 motionKeys 为空则不重算；
      变化时按 lookUpTarget（hide 用 flattenList 旧态定位，其余用 flattenNodes 当前态）
      顺序扫描，把连续命中 motionKeys 的一段节点收进 transitionRange 子数组，
      其余节点原样放入 transitionNodes；transitionRange 插回其起始位置（rangeStart）。

    render(): transitionNodes.length 且非 searchTargetIsDeep 时用 transitionNodes 渲染
      （数组项是子数组即 motion 段，包一层 NodeCollapsible；否则直接渲染该行）；
      否则直接用 flattenNodes 渲染（无进行中的过渡）。

    onMotionEnd：动画结束后清空 transitionNodes（回退为直接渲染 flattenNodes 当前态）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FlatNode, TreeKey } from '@chenzy-design/core';
  import NodeCollapsible from './nodeCollapsible.svelte';

  type TransitionEntry = FlatNode | FlatNode[];

  interface Props {
    flattenNodes: FlatNode[];
    motionKeys: ReadonlySet<TreeKey>;
    motionType: 'show' | 'hide' | '';
    /** 收起前（旧态）的扁平列表，hide 动画用它定位被收起的行（对齐 Semi flattenList）。 */
    flattenList: FlatNode[];
    searchTargetIsDeep?: boolean;
    motion: boolean;
    onMotionEnd?: () => void;
    /** 渲染单行（对应 Semi renderTreeNode）；posStyle 由虚拟化调用方传入，非虚拟化时为 undefined。 */
    renderTreeNode: Snippet<[FlatNode, string | undefined]>;
  }

  const {
    flattenNodes,
    motionKeys,
    motionType,
    flattenList,
    searchTargetIsDeep = false,
    motion,
    onMotionEnd,
    renderTreeNode,
  }: Props = $props();

  function getTreeNodeKey(node: FlatNode): TreeKey {
    return node.node.key;
  }

  function keysEqual(a: TreeKey[], b: TreeKey[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function setsEqual(a: ReadonlySet<TreeKey>, b: ReadonlySet<TreeKey>): boolean {
    if (a.size !== b.size) return false;
    for (const k of a) if (!b.has(k)) return false;
    return true;
  }

  let transitionNodes = $state<TransitionEntry[]>([]);
  // 缓存上一次计算所依据的 motionKeys / flattenNodes.keys（对齐 Semi prevState.cachedMotionKeys/cachedData）。
  let cachedMotionKeys = new Set<TreeKey>();
  let cachedDataKeys: TreeKey[] = [];

  $effect(() => {
    const nextDataKeys = flattenNodes.map(getTreeNodeKey);
    const hasChanged =
      !setsEqual(cachedMotionKeys, motionKeys) || !keysEqual(cachedDataKeys, nextDataKeys);
    const motionArr = [...motionKeys];
    if (!hasChanged || !motionArr.length) return;

    const nextTransitionNodes: TransitionEntry[] = [];
    const transitionRange: FlatNode[] = [];
    let rangeStart = 0;
    const lookUpTarget = motionType === 'hide' && flattenList ? flattenList : flattenNodes;
    lookUpTarget.forEach((node, ind) => {
      const nodeKey = getTreeNodeKey(node);
      if (motionKeys.has(nodeKey)) {
        transitionRange.push(node);
        if (nodeKey === motionArr[0]) rangeStart = ind;
      } else {
        nextTransitionNodes.push(node);
      }
    });
    nextTransitionNodes.splice(rangeStart, 0, transitionRange);

    transitionNodes = nextTransitionNodes;
    cachedMotionKeys = new Set(motionKeys);
    cachedDataKeys = nextDataKeys;
  });

  function handleMotionEnd(): void {
    onMotionEnd?.();
    transitionNodes = [];
  }

  const mapData = $derived(
    transitionNodes.length && !searchTargetIsDeep ? transitionNodes : flattenNodes,
  );
</script>

{#each mapData as entry (Array.isArray(entry) ? `motion-${entry[0] ? getTreeNodeKey(entry[0]) : 'empty'}` : getTreeNodeKey(entry))}
  {#if Array.isArray(entry)}
    {#if entry.length}
      <NodeCollapsible open={motionType === 'hide'} duration={200} {motion} onMotionEnd={handleMotionEnd}>
        {#snippet children()}
          {#each entry as node (getTreeNodeKey(node))}
            {@render renderTreeNode(node, undefined)}
          {/each}
        {/snippet}
      </NodeCollapsible>
    {/if}
  {:else}
    {@render renderTreeNode(entry, undefined)}
  {/if}
{/each}
