---
name: i18n
description: chenzy-design 国际化实现手册。当组件含用户可见文案、日期/数字格式或需支持多语言/RTL 时使用。
---

# SKILL · 国际化（i18n）

> 配套 SPEC：`specs/00-foundation/i18n.spec.md`。包：`@chenzy-design/locale`。

## 铁律：零硬编码
组件里任何用户可见字符串都必须 `t('Component.key')`，不许字面量。

## 步骤
1. **登记 key**：在 `packages/locale/src/interface.ts` 的对应分组加类型，key 命名 `Component.field`（如 `Modal.okText`）。
2. **填默认语言**：至少补 `zh_CN.ts`、`en_US.ts`，文案需过 content-guidelines 审校。
3. **组件内取值**：通过 context 拿当前 locale → `t(key, params)`。
4. **格式化**：日期/数字/货币/复数一律用 `Intl.*`（`format.ts` 封装），不要手拼。
5. **RTL**：locale 含 `rtl` 标记 → 联动 `dir` 与逻辑属性。
6. **按需**：语言包可动态 import；默认只打包 `zh_CN`。

## 示例
```ts
t('Pagination.total', { total })        // 插值
new Intl.PluralRules(locale).select(n)  // 复数
```

## 检查清单
- [ ] 无硬编码用户可见字符串（lint 扫描）。
- [ ] 新增 key 已加类型且各语言包齐全（缺失 dev 警告）。
- [ ] 日期/数字走 Intl，随 locale 变化。
- [ ] RTL 下方向正确。
