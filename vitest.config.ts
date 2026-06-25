import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// 两个 vitest project 精确切分：
//  - unit：node 环境，跑现有纯函数测试（packages/**/*.{test,spec}.ts），
//    显式 exclude a11y 渲染测试，避免被拖进 node 跑（缺 DOM 会崩）。
//  - dom：jsdom 环境 + svelte 插件，只跑 *.a11y.test.ts 渲染/axe 测试。
// 关键：两个 include/exclude 互补，互不交叉。
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
          // a11y 渲染测试只在 dom project 跑，不在 node 跑。
          exclude: ['**/node_modules/**', '**/dist/**', '**/*.a11y.test.ts'],
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
          exclude: ['**/node_modules/**', '**/dist/**'],
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
            exclude: ['**/node_modules/**', '**/dist/**'],
          },
        },
      },
    ],
  },
});
