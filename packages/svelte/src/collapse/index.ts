import Collapse_ from './Collapse.svelte';
import CollapsePanelComponent from './CollapsePanel.svelte';

export const Collapse: typeof Collapse_ & {
  Panel: typeof CollapsePanelComponent;
} = Object.assign(Collapse_, { Panel: CollapsePanelComponent });

export { CollapsePanelComponent };
export { meta as collapseMeta } from './meta.js';
export {
  getCollapseContext,
  setCollapseContext,
  type CollapseContext,
  type CollapseIconPosition,
} from './context.js';
