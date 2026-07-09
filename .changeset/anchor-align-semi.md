---
'@chenzy-design/svelte': minor
---

feat(anchor): 深度对齐 Semi Anchor（双 API + 补齐能力）

「Semi 有的我们要有」逐 prop 核对 Semi Anchor API 表补齐能力，并新增声明式子组件写法。

**新增声明式 `<Anchor.Link>` 双 API**（对齐 Semi 形态，照 Nav 收集器范式）：
```svelte
<Anchor>
  <Anchor.Link href="#a" title="基本">
    <Anchor.Link href="#b" title="嵌套" />
  </Anchor.Link>
</Anchor>
```
- 与现有 `links` 数组互斥共存（传 `links` 用数组、否则用子组件收集）。
- 收集器用「普通数组 + revision `$state` + `queueMicrotask` 异步 bump」规避 Svelte5 读写自循环，浏览器实测无 `effect_update_depth_exceeded`。
- 声明式链接完整参与 scroll-spy（滚动高亮联动已实测）。

**补齐主组件 prop**：`railTheme`（primary/tertiary/muted，消费已备 slide token）、`size`（small/default）、`maxHeight`（默认 750px）、`maxWidth`（默认 200px）、`style`（透传根 nav）、`onClick`（`(event, link)`）。

**补齐 Link 级 prop**：`disabled`（禁用不跳转、置灰、排除 roving tabindex）、`className`、`style`。

**⚠️ 破坏性变更**：
- `scrollMotion` 默认值 `true → false`（对齐 Semi，默认从平滑滚动变即时跳转；需平滑滚动请显式传 `scrollMotion={true}`）。
- `onChange` 签名 `(key: string) → (currentLink: AnchorLink | null, previousLink: AnchorLink | null)`（对齐 Semi，回调收到 link 对象而非仅 key；取 key 用 `currentLink?.key`）。

**未纳入**：`showTooltip` + `position`（依赖 Tooltip 集成，后续单独补），已在 types 预留 TODO。
