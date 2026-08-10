import { getContext, setContext } from 'svelte';
import type { OptionData, OptionOrGroup } from './types.js';

/**
 * 组合式 <Select.Option> / <Select.OptGroup> 的 context 收集机制（对齐 Semi
 * Select.Option / Select.OptGroup children 声明），与配置式 `optionList` prop
 * 并存（照本库 Tabs/TabPane、Steps/Step、Table/Column 双写法惯例）。
 *
 * 只有两层：根收集器（Select 持有，收 <Select.Option> 与 <Select.OptGroup>）、
 * 组收集器（每个 <Select.OptGroup> 持有，只收其下 <Select.Option>，Semi 不支持
 * 分组嵌套分组）。snapshot() 产出与 optionList prop 等价的 OptionOrGroup[]。
 *
 * 红线 #2：register 在子组件 init 期（setContext 必须 init 期完成）；unregister
 * 在 effect cleanup；元数据同步在独立 effect 去重写。均只写收集器、不读快照。
 */

interface OptionNode {
  id: number;
  data: OptionData;
}

interface GroupNode {
  id: number;
  label: string;
  optionCollector: OptionCollector;
}

/** <Select.Option> 侧消费的最小接口：组收集器与根收集器共用同一方法名，Option.svelte 无需分支判断挂哪层。 */
export interface OptionRegistrar {
  register(data: OptionData): number;
  update(id: number, data: OptionData): void;
  unregister(id: number): void;
}

/** 组内收集器：<Select.OptGroup> 专用，只收 <Select.Option>。 */
export interface OptionCollector extends OptionRegistrar {
  snapshot(): OptionData[];
}

/** 根收集器：Select 持有，收 <Select.Option> 与 <Select.OptGroup>（按注册顺序混排）。 */
export interface RootOptionCollector extends OptionRegistrar {
  registerGroup(label: string): { id: number; collector: OptionCollector };
  updateGroupLabel(id: number, label: string): void;
  unregisterGroup(id: number): void;
  snapshot(): OptionOrGroup[];
}

function dataEqual(a: OptionData, b: OptionData): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof OptionData>;
  for (const k of keys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function createOptionCollector(bump: () => void): OptionCollector {
  const order: OptionNode[] = [];
  let nextId = 0;
  return {
    register(data) {
      const id = nextId++;
      order.push({ id, data });
      bump();
      return id;
    },
    update(id, data) {
      const node = order.find((n) => n.id === id);
      if (!node || dataEqual(node.data, data)) return;
      node.data = data;
      bump();
    },
    unregister(id) {
      const i = order.findIndex((n) => n.id === id);
      if (i !== -1) {
        order.splice(i, 1);
        bump();
      }
    },
    snapshot() {
      return order.map((n) => n.data);
    },
  };
}

/** 一个混排项：叶子 Option 或 Group（按注册顺序保序） */
type Entry = { kind: 'option'; node: OptionNode } | { kind: 'group'; node: GroupNode };

export function createRootOptionCollector(bump: () => void): RootOptionCollector {
  const entries: Entry[] = [];
  let nextOptionId = 0;
  let nextGroupId = 0;

  return {
    register(data) {
      const id = nextOptionId++;
      entries.push({ kind: 'option', node: { id, data } });
      bump();
      return id;
    },
    update(id, data) {
      const entry = entries.find((e) => e.kind === 'option' && e.node.id === id) as
        | { kind: 'option'; node: OptionNode }
        | undefined;
      if (!entry || dataEqual(entry.node.data, data)) return;
      entry.node.data = data;
      bump();
    },
    unregister(id) {
      const i = entries.findIndex((e) => e.kind === 'option' && e.node.id === id);
      if (i !== -1) {
        entries.splice(i, 1);
        bump();
      }
    },
    registerGroup(label) {
      const id = nextGroupId++;
      const optionCollector = createOptionCollector(bump);
      entries.push({ kind: 'group', node: { id, label, optionCollector } });
      bump();
      return { id, collector: optionCollector };
    },
    updateGroupLabel(id, label) {
      const entry = entries.find((e) => e.kind === 'group' && e.node.id === id) as
        | { kind: 'group'; node: GroupNode }
        | undefined;
      if (!entry || entry.node.label === label) return;
      entry.node.label = label;
      bump();
    },
    unregisterGroup(id) {
      const i = entries.findIndex((e) => e.kind === 'group' && e.node.id === id);
      if (i !== -1) {
        entries.splice(i, 1);
        bump();
      }
    },
    snapshot() {
      return entries.map((e) =>
        e.kind === 'option' ? e.node.data : { label: e.node.label, options: e.node.optionCollector.snapshot() },
      );
    },
  };
}

const ROOT_KEY = Symbol('cd-select-options');
const GROUP_KEY = Symbol('cd-select-group-options');

export function setRootOptionsContext(collector: RootOptionCollector): void {
  setContext(ROOT_KEY, collector);
}
export function getRootOptionsContext(): RootOptionCollector | undefined {
  return getContext<RootOptionCollector | undefined>(ROOT_KEY);
}
export function setGroupOptionsContext(collector: OptionCollector): void {
  setContext(GROUP_KEY, collector);
}
export function getGroupOptionsContext(): OptionCollector | undefined {
  return getContext<OptionCollector | undefined>(GROUP_KEY);
}
