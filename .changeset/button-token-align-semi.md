---
'@chenzy-design/tokens': minor
'@chenzy-design/svelte': minor
---

feat(button): token 值全面对齐 Semi + 引入 white/black 基元

- button：component token 逐项对齐 Semi 真实值（用 resolve-final.mjs 解析 dist 最终字面量核对，非拍脑袋估计），Button/ButtonGroup/SplitButtonGroup 消费同步更新，meta 补齐。
- tokens：新增 `--cd-color-white` / `--cd-color-black` 基元（rgba，对齐 Semi `$white`/`$black`）；删除自造的 `color-text-inverse`，全站白字/黑字统一收敛到 white/black 基元。
- 连带收敛：avatar/badge/tag/upload/carousel/cascader/popover/checkbox/radio/slider/steps/switch/date-picker/video-player 等多组件的 token 消费改吃 white/black 基元，去除散落的 inverse 别名。
- 对比度：contrast-check 同步更新受影响的配对断言。
