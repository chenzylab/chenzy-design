/**
 * CSS 副作用引入的类型声明。
 *
 * 背景：browser project（真实 chromium）不像 docs 那样自动带上设计变量 CSS，
 * 需要断言真实颜色/边框的夹具必须显式 `import '@chenzy-design/tokens/tokens.css'`，
 * 否则所有 `var(--cd-*)` 解析失败、读数恒为 0px / transparent，
 * 断言「恒真」测不出任何回归。
 *
 * 但 TS 不认识 `.css` 副作用引入（`Cannot find module or type declarations for
 * side-effect import`），故在此声明。
 */
declare module '*.css';
