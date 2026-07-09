---
'@chenzy-design/svelte': minor
---

feat(anchor): 补齐 autoCollapse（Anchor 主组件 API 100% 覆盖 Semi）

Semi Anchor 主组件最后一个未覆盖的 prop，至此 Anchor 主组件 API 全量对齐。

- **autoCollapse**: `boolean`，默认 `false`（全展开）。开启后滚动时只展开当前激活路径的子级、折叠其它分支——一个链接的 children 仅在「本链接激活」或「激活链接是其后代」时渲染（对齐 Semi `link.tsx` renderChildren 语义）。
- 用纯函数 `buildChildMap` 派生 `key → 后代 key 集合`（对齐 Semi `_getLinkToMap`），`shouldRenderChildren` 判定折叠，全部纯派生、零副作用、无自循环。
- 浏览器实测：初始只展开激活章的小节、其它章折叠；滚动到另一章时动态反转展开/折叠，无控制台报错。
