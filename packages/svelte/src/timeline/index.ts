import Timeline_ from './Timeline.svelte';
import TimelineItem from './TimelineItem.svelte';

export const Timeline: typeof Timeline_ & {
  Item: typeof TimelineItem;
} = Object.assign(Timeline_, { Item: TimelineItem });

export { TimelineItem };
export { meta as timelineMeta } from './meta.js';
export type { TimelineItemData } from './types.js';
export {
  getTimelineContext,
  setTimelineContext,
  type TimelineContext,
  type TimelineLineStyle,
} from './context.js';
