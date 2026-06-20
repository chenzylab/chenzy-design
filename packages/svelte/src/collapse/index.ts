import Collapse_ from './Collapse.svelte';
import CollapsePanelComponent from './CollapsePanel.svelte';

export const Collapse: typeof Collapse_ & {
  Panel: typeof CollapsePanelComponent;
} = Object.assign(Collapse_, { Panel: CollapsePanelComponent });

export { CollapsePanelComponent };
export { meta as collapseMeta } from './meta.js';
export type { CollapsePanel } from './types.js';
export {
  getCollapseContext,
  setCollapseContext,
  type CollapseContext,
  type CollapseSize,
  type CollapseIconPosition,
} from './context.js';
