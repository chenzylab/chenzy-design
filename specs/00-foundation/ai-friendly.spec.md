# SPEC · 让 AI 体验有章可循（AI-Friendly）

> 需求 6。参考：https://semi.design/blogs/zh-CN/article/AI

## 目标
让 AI（代码助手、生成式工具）能**可靠地理解与正确使用**本组件库：结构化元数据 + 一致约定 + 可消费的知识源。

## 交付物

### 1. 组件元数据（每个组件一份）
`component.meta.ts`，机器可读，供文档、AI、设计工具消费：
```ts
export const meta = {
  name: 'Button',
  category: 'basic',
  description: '触发操作的按钮。',
  props: [{ name:'type', type:"'primary'|'secondary'|...", default:'secondary', desc:'...' }],
  events: [...], slots: [...],
  a11y: { role:'button', keyboard:['Enter','Space'] },
  tokens: ['--cd-button-*'],
  examples: [{ title:'基础', code:'<Button>OK</Button>' }],
}
```

### 2. 机器可读清单
构建产出 `dist/components.json`（聚合所有 meta）+ 类型声明，供 AI 检索「有哪些组件/props/用法」。

### 3. 项目根 `AGENTS.md` + 各 SKILL
本仓库本身即遵循 AGENTS.md + SKILL 范式，保证 AI agent 接入即有章可循。对外提供精简版「llms.txt」式入口，指向组件清单与用法。

### 4. 一致性约定（降低 AI 出错率）
- props/events/slots 命名跨组件统一（如受控统一 `value` + `on:change`，开关统一 `open` + `on:openChange`）。
- 错误提示清晰、可定位。
- 示例代码可直接运行、覆盖典型场景。

## 验收标准
- [ ] 每个组件有 `component.meta.ts` 且通过 schema 校验。
- [ ] 构建产出聚合 `components.json`。
- [ ] 跨组件 API 命名一致性检查通过。
- [ ] 文档站从 meta 自动生成 API 表，保证文档与代码不漂移。
