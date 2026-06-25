import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
// vitest 4.1：browser.provider 改为接收工厂函数（不再是字符串 'playwright'）。
import { playwright } from '@vitest/browser-playwright';

// 四个 vitest project 精确切分（include/exclude 互补，互不交叉）：
//  - unit：node 环境，跑现有纯函数测试（packages/**/*.{test,spec}.ts），
//    显式 exclude a11y 渲染测试与键盘 e2e，避免被拖进 node 跑（缺 DOM 会崩）。
//  - dom：jsdom 环境 + svelte 插件，只跑 *.a11y.test.ts 渲染/axe 测试。
//  - bench：jsdom 环境，只跑 *.bench.ts（仅 `vitest bench`）。
//  - browser：真实 chromium（playwright provider），只跑 *.kbd.test.ts 键盘 e2e。
//    jsdom 焦点模型不完整、委托事件合成不可靠（项目已知教训），真实焦点移动/
//    focus-trap/roving 导航只能在真浏览器里测，故新增本 project。
// 关键：unit/dom/bench 三个 project 的 exclude 都加 **/*.kbd.test.ts，
// browser project 只跑 kbd 测试，互不重复（防全仓重跑膨胀的历史教训）。
export default defineConfig({
  test: {
    projects: [
      {
        // 纯函数单测：保持原有 node 环境与覆盖范围不变。
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/**/*.{test,spec}.ts'],
          // a11y 渲染测试只在 dom project 跑；键盘 e2e 只在 browser project 跑。
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.a11y.test.ts', '**/*.kbd.test.ts'],
          // bench 文件只在 bench project 跑（需 svelte 编译，node 下会解析失败）。
          benchmark: { include: [] },
        },
      },
      {
        // a11y 渲染/axe 测试：需要 jsdom + svelte 组件编译。
        plugins: [svelte({ compilerOptions: { dev: true } })],
        // 关键：jsdom 下要走 svelte 的 browser/client 导出，否则 mount() 解析到
        // server 构建并抛 lifecycle_function_unavailable。conditions 加 browser。
        resolve: {
          conditions: ['browser'],
        },
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['packages/**/*.a11y.test.ts'],
          // 键盘 e2e 只在 browser project 跑，dom project 不碰。
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.kbd.test.ts'],
          setupFiles: ['./vitest.dom-setup.ts'],
          // bench 文件只在 bench project 跑，dom project 不重复执行。
          benchmark: { include: [] },
        },
      },
      {
        // 运行时基准（perf:bench）：最小骨架，仅趋势参考，不接 CI 门禁。
        // 与 dom project 一样需要 jsdom + svelte 编译，才能真实 mount 组件测渲染耗时。
        // benchmark.include 只匹配 *.bench.ts，故 `vitest run`（单测）不会跑到它，
        // 只有 `vitest bench` 才执行；不影响现有 unit/dom project。
        plugins: [svelte({ compilerOptions: { dev: false } })],
        resolve: {
          conditions: ['browser'],
        },
        test: {
          name: 'bench',
          environment: 'jsdom',
          setupFiles: ['./vitest.dom-setup.ts'],
          // 关键：bench project 只跑 benchmark，不跑普通单测。缺省 include 会让
          // `vitest run` 把全仓（含 dist 编译副本）测试在 jsdom+svelte 下重跑一遍
          // （CI test 步骤曾因此从 ~1min 膨胀到 7.5min）。显式 include:[] 关闭单测扫描。
          include: [],
          benchmark: {
            include: ['packages/**/*.bench.ts'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/*.kbd.test.ts'],
          },
        },
      },
      {
        // 键盘 e2e（test:e2e）：真实 chromium headless（playwright provider）。
        // 只跑 *.kbd.test.ts —— 真实焦点移动 / focus-trap / roving 导航，
        // 这些 jsdom 测不了（焦点模型不完整、委托事件合成不可靠）。
        plugins: [svelte({ compilerOptions: { dev: true } })],
        // 同 dom project：走 svelte 的 browser/client 导出，避免 mount 解析到 server 构建。
        resolve: {
          conditions: ['browser'],
        },
        test: {
          name: 'browser',
          // browser project 不在 vitest run 默认范围跑（只在 `--project browser` / test:e2e 跑），
          // 但仍显式收紧 include 到 kbd，且 exclude 掉 a11y/单测，杜绝交叉。
          include: ['packages/**/*.kbd.test.ts'],
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.a11y.test.ts'],
          benchmark: { include: [] },
          browser: {
            enabled: true,
            // vitest 4.1：provider 取工厂函数（playwright()），非字符串。
            provider: playwright(),
            headless: true,
            // vitest 4 browser API：多浏览器用 instances 数组，这里只跑 chromium。
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
