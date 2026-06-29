---
"@chenzy-design/docs": patch
---

文档站语言默认恒中文（不再跟随浏览器语言），消除英文浏览器下 SSR(zh)→客户端(en) 的首屏闪烁与中英混排。新增 demo 标题/描述双语机制：`LocalizedText` 类型 + `localize()` helper，详情页按 locale 取值，向后兼容纯字符串。Button 各 demo 标题/描述已补全中英双语。
