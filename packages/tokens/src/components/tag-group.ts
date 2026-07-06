/**
 * Component tokens for TagGroup / SplitTagGroup (M4 增补 · show).
 * 复用 Tag 视觉，仅补组容器所需的间距 / 分段合并边。回退 alias，禁写死。
 * Semi 无独立 group variables.scss（group 靠内联样式、splitTagGroup 靠 tag.css 分段 class），
 * 故这里为 chenzy-design 自有 token。
 */
import type { TokenGroup } from './token-def.js';

export const tagGroupTokens = {
  // TagGroup：松散标签组
  'taggroup-gap': { value: 'var(--cd-spacing-tight)', category: 'spacing', label: '标签间距', usage: '组内相邻标签的水平/换行间距' },
  // SplitTagGroup：连接式分段标签组
  'splittaggroup-divider-width': { value: '1px', category: 'width', label: '合并边宽', usage: '相邻分段之间的分隔线宽度' },
  'splittaggroup-divider-color': { value: 'var(--cd-color-border)', category: 'color', label: '合并边色', usage: '相邻分段之间的分隔线颜色' },
} satisfies TokenGroup;
