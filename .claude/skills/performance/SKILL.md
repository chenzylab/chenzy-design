---
name: performance
description: chenzy-design 性能手册。当组件涉及大数据渲染、浮层、高频事件，或需设定/校验性能预算时使用。
---

# SKILL · 性能

> 配套 SPEC：`specs/00-foundation/performance.spec.md`。

## 每个组件先定 Perf Budget
在组件 SPEC §9 填体积（gzip）与运行时预算；CI 用 size-limit + bench 校验，超标即失败。

## 优化套路（按需取用）
- **虚拟化**：长列表/大表格（Table/Tree/List/Select/VirtualList）只渲染可视区。
- **惰性渲染**：浮层内容首开才渲染；可选 `destroyOnClose` 卸载。
- **高频事件**：滚动/resize 用节流 + `{ passive:true }`；输入由使用方 debounce。
- **少响应式开销**：合理用 runes，避免无谓派生与重渲染；状态切换优先 class + token，少内联 style。
- **可摇树**：每组件独立 entry，标 `sideEffects`，避免顶层副作用。
- **SSR/hydration**：组件 SSR 安全，hydration 成本受控。

## 流水线
```
pnpm perf:size   # 体积预算
pnpm perf:bench  # 运行时基准
pnpm perf:check  # 汇总 + 回归阻断
```
基线存 `perf/baseline.json`；PR 出对比报告，回归超阈值阻断合并。

## 检查清单
- [ ] 体积在预算内且可 tree-shake。
- [ ] 大数据组件已虚拟化并达标。
- [ ] 浮层惰性渲染。
- [ ] 无性能回归（CI 报告）。
