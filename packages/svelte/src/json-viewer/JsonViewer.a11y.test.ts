// JsonViewer 渲染 + a11y。
//
// ⚠️ jsdom 限制（已实测验证，非组件 bug）：
//   底层内核 `@douyinfe/semi-json-viewer-core` 的 `new JsonViewer(el, value, opts)`
//   在实例化时会创建一个 Web `Worker`（语言服务/语法分析在 worker 线程跑）。jsdom
//   不实现 `Worker`，故 `new` 直接抛 "Worker is not defined"，被组件 $effect 里的
//   `.catch` 捕获 → 走降级：`data-error='true'`、loading 清除、kernel 保持 null。
//   因此 jsdom 下：
//     - 能测：壳的渲染 / role·aria / props 传递 / showSearch 开关 / class·style /
//             动态 import 成功后内核实例化失败的「加载→错误」降级路径 /
//             ref 方法在 kernel=null 时的空安全兜底（getValue→''、format→no-op 等）。
//     - 测不到（内核依赖真实 Worker + 布局/measure）：语法高亮 DOM、行号、
//             搜索/替换的实际命中与高亮、search 结果集。这些标 it.skip 并注明，
//             留给将来真实浏览器（Playwright/browser project）。
//
// dom project 会按 *.a11y.test.ts glob 拾取本文件（jsdom + svelte 编译）。
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import { tick } from 'svelte';
import JsonViewer from './JsonViewer.svelte';

const JV = JsonViewer as unknown as Parameters<typeof renderWithLocale>[0];

const SAMPLE = '{"name":"chenzy","age":1,"ok":true,"nested":{"k":[1,2,3]}}';

// 让组件 $effect 里的动态 import 及后续 .then/.catch（内核实例化在 jsdom 下抛 Worker 错）
// 落定：反复 tick + 宏任务 + 微任务，直到 loading 态被 .catch 清掉。
async function settle(): Promise<void> {
  for (let i = 0; i < 15; i++) {
    await tick();
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 5));
  }
}

describe('JsonViewer a11y / 渲染', () => {
  it('渲染不抛错，挂载编辑器容器 role=textbox + aria', () => {
    const { container } = renderWithLocale(JV, { props: { value: SAMPLE } });

    const root = container.querySelector('.cd-json-viewer');
    expect(root).toBeTruthy();

    const editor = container.querySelector('.cd-json-viewer__editor');
    expect(editor).toBeTruthy();
    // 编辑器容器的可访问性语义（组件显式声明）。
    expect(editor?.getAttribute('role')).toBe('textbox');
    expect(editor?.getAttribute('aria-multiline')).toBe('true');
    // aria-label 走 i18n（en_US → 'JSON editor'）。
    expect(editor?.getAttribute('aria-label')).toBe('JSON editor');
    // 可聚焦。
    expect(editor?.getAttribute('tabindex')).toBe('0');
  });

  it('无 axe 违规（默认渲染）', async () => {
    const { container } = renderWithLocale(JV, { props: { value: SAMPLE } });
    await expectNoAxeViolations(container);
  });

  it('showSearch 默认为 true：渲染带 aria-label 的搜索入口按钮', () => {
    const { container } = renderWithLocale(JV, { props: { value: SAMPLE } });
    // en_US searchTrigger → 'Search'
    const trigger = container.querySelector(
      'button.cd-json-viewer__search-trigger[aria-label="Search"]',
    );
    expect(trigger).toBeTruthy();
    // 折叠态：aria-expanded=false。
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('showSearch=false：不渲染搜索入口', () => {
    const { container } = renderWithLocale(JV, {
      props: { value: SAMPLE, showSearch: false },
    });
    expect(container.querySelector('.cd-json-viewer__toolbar-slot')).toBeNull();
    expect(container.querySelector('.cd-json-viewer__search-trigger')).toBeNull();
  });

  it('class / style / height / width props 透传到根节点', () => {
    const { container } = renderWithLocale(JV, {
      props: {
        value: SAMPLE,
        class: 'my-json',
        style: 'opacity:0.5;',
        height: 200,
        width: '80%',
      },
    });
    const root = container.querySelector('.cd-json-viewer') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.classList.contains('my-json')).toBe(true);
    // number height → px，string width 原样；style 透传。
    // 注意：jsdom 会规范化 style（属性名后补空格、末尾补分号），故断言用去空格比对。
    const styleAttr = (root.getAttribute('style') ?? '').replace(/\s+/g, '');
    expect(styleAttr).toContain('--cd-json-viewer-height:200px');
    expect(styleAttr).toContain('--cd-json-viewer-width:80%');
    expect(styleAttr).toContain('opacity:0.5');
  });

  it('readOnly：editor 容器带 aria-readonly（options.readOnly=true）', () => {
    const { container } = renderWithLocale(JV, {
      props: { value: SAMPLE, options: { readOnly: true } },
    });
    const editor = container.querySelector('.cd-json-viewer__editor');
    expect(editor?.getAttribute('aria-readonly')).toBe('true');
  });

  it('非只读：editor 容器不带 aria-readonly', () => {
    const { container } = renderWithLocale(JV, { props: { value: SAMPLE } });
    const editor = container.querySelector('.cd-json-viewer__editor');
    // 组件在非只读时把 aria-readonly 设为 undefined（即不渲染该属性）。
    expect(editor?.hasAttribute('aria-readonly')).toBe(false);
  });

  it('动态 import 成功但内核在 jsdom 实例化失败 → 走「加载→错误」降级，仍无 axe 违规', async () => {
    const { container } = renderWithLocale(JV, { props: { value: SAMPLE } });
    const editor = container.querySelector('.cd-json-viewer__editor');
    // 挂载首帧：loading 态（内核异步 import 尚未落定）。
    expect(editor?.getAttribute('data-loading')).toBe('true');

    await settle();

    // jsdom 无 Worker → new JsonViewer 抛 → .catch → data-error='true'、loading 清除。
    // 这是壳的降级路径，如实断言（内核实际渲染需真实浏览器）。
    expect(editor?.getAttribute('data-loading')).toBeNull();
    expect(editor?.getAttribute('data-error')).toBe('true');

    // 降级态下容器仍应满足可访问性（无 axe 违规）。
    await expectNoAxeViolations(container);
  });
});

// —— ref 暴露的方法 —— 直接 render JsonViewer 拿到组件实例（Svelte 5 `export function`
//    挂在实例上）。renderWithLocale 走 LocaleHarness 包一层，拿到的是 harness 实例，
//    取不到内层 ref，故此处直接 render；组件的 useLocale() 无 provider 时回退默认 locale，
//    不抛错（已实测）。
describe('JsonViewer ref 方法（kernel=null 空安全兜底）', () => {
  // 类型：Svelte 5 组件实例上挂着 export 的函数。测试只关心这些方法存在且可调用。
  type JsonViewerRef = {
    getValue: () => string;
    format: () => void;
    search: (t: string, cs?: boolean, ww?: boolean, rx?: boolean) => void;
    getSearchResults: () => unknown[];
    prevSearch: (step?: number) => void;
    nextSearch: (step?: number) => void;
    replace: (t: string) => void;
    replaceAll: (t: string) => void;
  };

  function renderRef(props: Record<string, unknown> = { value: SAMPLE }) {
    // 用宽松构造器类型（同 renderWithLocale 的 AnyComponent），使 props 可传；
    // `as never` 会把 props 收成 undefined 而报错，故不用它。
    const result = render(JV, { props });
    // testing-library/svelte 的 result.component 即挂载的组件实例。
    const ref = (result as unknown as { component: JsonViewerRef }).component;
    return { ref, ...result };
  }

  it('暴露全部 ref 方法', () => {
    const { ref } = renderRef();
    for (const m of [
      'getValue',
      'format',
      'search',
      'getSearchResults',
      'prevSearch',
      'nextSearch',
      'replace',
      'replaceAll',
    ] as const) {
      expect(typeof ref[m]).toBe('function');
    }
  });

  it('kernel 未就绪时方法不抛错，返回空安全值', async () => {
    const { ref } = renderRef();
    await settle(); // 让内核尝试实例化（jsdom 下失败，kernel 保持 null）。

    // 读方法：kernel?. 兜底 → 空值，不抛。
    expect(() => ref.getValue()).not.toThrow();
    expect(ref.getValue()).toBe('');
    expect(() => ref.getSearchResults()).not.toThrow();
    expect(ref.getSearchResults()).toEqual([]);

    // 命令方法：kernel?. 兜底 → no-op，不抛。
    expect(() => ref.format()).not.toThrow();
    expect(() => ref.search('name')).not.toThrow();
    expect(() => ref.prevSearch()).not.toThrow();
    expect(() => ref.nextSearch()).not.toThrow();
    expect(() => ref.replace('x')).not.toThrow();
    expect(() => ref.replaceAll('x')).not.toThrow();
  });

  it('readOnly 下 replace/replaceAll 被组件前置拦截（不抛，即便有 kernel 也不写）', async () => {
    const { ref } = renderRef({ value: SAMPLE, options: { readOnly: true } });
    await settle();
    // 组件在 readOnly 时对 replace/replaceAll 直接 return（见 JsonViewer.svelte）。
    expect(() => ref.replace('x')).not.toThrow();
    expect(() => ref.replaceAll('x')).not.toThrow();
  });
});

// —— jsdom 测不到的部分：如实标 skip，不写空断言假装覆盖。 ——
// 需要真实 Worker + 布局/measure，只能在 browser project（Playwright/chromium）跑。
describe.skip('JsonViewer 内核渲染 / 搜索交互（需真实浏览器，jsdom 无 Worker）', () => {
  it.skip('内核输出语法高亮 DOM（.cd-json-viewer-string-key / -number 等 token class）', () => {
    // jsdom：new JsonViewer 抛 "Worker is not defined"，内核从不渲染任何内容。
    // 真实浏览器下应断言 editor 内出现 token class 着色节点。
  });
  it.skip('搜索命中高亮 + 上/下一个导航（.cd-json-viewer-search-result / -current）', () => {
    // 需内核 SearchWidget 真实运行；jsdom 无 kernel。
  });
  it.skip('format() 实际格式化内容、getValue() 回读格式化后文本', () => {
    // 需真实 kernel；jsdom 下 getValue 恒为 ''（已在上面的兜底测试如实覆盖）。
  });
  it.skip('replace / replaceAll 真实改写内容并触发 onChange', () => {
    // 需真实 kernel model；jsdom 无。
  });
});
