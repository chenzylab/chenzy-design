# SPEC · 性能基准（Performance Baseline）

> 需求 4。参考：
> - https://semi.design/blogs/zh-CN/article/PerfBaseline
> - https://semi.design/blogs/zh-CN/article/Performance
> 配套 SKILL：`.claude/skills/performance/`

## 思路
建立**可量化的性能基线**并防回归：每个组件有明确的预算（Perf Budget），CI 持续测量与对比。

## 三类指标
1. **包体积（Bundle）**：每个组件独立 entry，记录 minified + gzip 体积；设上限并在 CI 比对（size-limit）。要求支持 tree-shaking（`sideEffects` 标注、按组件导出）。
2. **运行时（Runtime）**：挂载/更新耗时、大数据量渲染（如 Table 1k 行、VirtualList 10k 项）的帧率与交互延迟。
3. **首屏/SSR**：组件 SSR 可用、hydration 成本受控。

## 关键手段
- [ ] **虚拟化**：长列表/大表格内置 VirtualList，避免全量 DOM。
- [ ] **事件代理与节流**：滚动/resize/输入用节流/防抖与被动监听。
- [ ] **惰性渲染**：浮层内容延迟到首次打开才渲染；可选 `destroyOnClose`。
- [ ] **避免不必要响应式**：合理使用 Svelte 5 runes，减少派生计算与重渲染。
- [ ] **CSS 优先**：状态切换尽量靠 class + token，避免 JS 内联样式抖动。

## 性能基准流水线
```
pnpm perf:size     # size-limit 比对各组件体积预算
pnpm perf:bench    # 运行时基准（Vitest bench / Playwright 采样）
pnpm perf:check    # 汇总，超预算则 CI 失败
```
基线数据存 `perf/baseline.json`，PR 输出对比报告（回归 > 阈值则阻断）。

## 每个组件 SPEC 必填「Perf Budget」
示例：
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 4 KB |
| 1k 行渲染 | ≤ 16ms/帧（虚拟化）|
| 浮层首开 | 惰性渲染 |

## 验收标准
- [ ] 每个组件有体积预算并在 CI 校验。
- [ ] 大数据组件（Table/Tree/List/Select）支持虚拟化且达标。
- [ ] 基线可复现，PR 自动出回归报告。
