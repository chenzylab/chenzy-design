/**
 * 语言包与消费方的双向覆盖闸门。
 *
 * 落在 svelte 包而非 locale 包：本测试要扫消费方源码，而 locale 是刻意不依赖
 * 框架的纯包。源码经 vite `import.meta.glob(?raw)` 读入（无需 node fs /
 * @types/node，同 `_floating/floating-animation-guard.test.ts` 的既有手法）。
 *
 * 背景（真实踩坑）：`createLocale().t(key)` 在键缺失时**返回裸 key 本身**（见 locale 包
 * create-locale.ts 的 `?? key` 兜底），所以「组件引用了语言包没有的键」不会报错、不会崩，
 * 只会把 `Chat.copied` 这样的字符串直接渲染给用户——typecheck 与单测全绿也照样藏得住。
 * 反方向同样无声：语言包里声明了却没人消费的键会一直躺着（本仓一次审计出 70 个，
 * 含组件早被删除的 Drawer 整片残渣）。
 *
 * 故用一条测试同时守两个方向：
 * 1. 正向：源码里所有 `t('X.y')` 字面量都必须能在 zh_CN / en_US 里解析出真值；
 * 2. 反向：语言包里每个叶子键都必须有消费方（整片经 `component('X')` 读取的除外）。
 */
import { describe, expect, it } from 'vitest';
import { zh_CN, en_US, type Locale } from '@chenzy-design/locale';

// 消费方源码全文。**必须连 core 一起扫**：core 自身不调 `t()`（无 locale 依赖），但它的
// 规则层持有键字面量——`core/src/form-validate.ts` 产出 `{ key: 'Form.required' }` 这样的
// 描述符，交由 Form.svelte 的 `loc().t(d.key)` 动态翻译。只扫 svelte 包会把这 7 个
// Form.* 校验键误判成悬空（本测试初版正是这么假红的）。
// docs 站另有一套自己的小写命名空间字典（home./api. 等），不消费本包 locale，故不扫。
// import.meta.glob 是 vite 运行时能力；本包 tsconfig 无 vite/client 类型，
// 故经 unknown 桥接取用（vitest 运行时由 vite 提供）。
const globRaw = (
  import.meta as unknown as {
    glob: (
      pattern: string[],
      opts: { eager: true; query: '?raw'; import: 'default' },
    ) => Record<string, string>;
  }
).glob(['./**/*.svelte', './**/*.ts', '../../core/src/**/*.ts'], {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** 排除测试自身与测试夹具，避免「测试里写的键」被当成真实消费。 */
const SOURCES = Object.entries(globRaw)
  .filter(([file]) => !/\.(test|spec)\.ts$/.test(file) && !/Fixture\.svelte$/.test(file))
  .map(([, code]) => code);

/**
 * 经 `component('X')` 整片读取的 slice：其子键由消费方按属性访问（如
 * `DatePicker.placeholder.dateRange`），不出现在 `t()` 字面量里，故反向检查放行整片。
 */
const WHOLE_SLICE_CONSUMERS = new Set(['DatePicker']);

/** 非文案字段，不参与覆盖判定。 */
const NON_MESSAGE_KEYS = new Set(['code', 'rtl', 'dateFnsLocale']);

/**
 * 源码里所有 `t('X.y')` 形式的键字面量（真实调用点）。
 * 逐行剔除注释：`use-locale.ts` 的 JSDoc 里就有 `loc().t('Component.field')` 这样的
 * 示例，它不是调用点，早期版本因此假红过。
 */
function collectReferencedKeys(): string[] {
  const keys = new Set<string>();
  for (const code of SOURCES) {
    for (const line of code.split('\n')) {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) continue;
      for (const m of line.matchAll(/\bt\(\s*['"`]([A-Za-z]+\.[A-Za-z_0-9.]+)['"`]/g)) {
        keys.add(m[1]!);
      }
    }
  }
  return [...keys];
}

/**
 * 消费方源码里全部「带引号的点号路径」字面量，供反向检查做集合查表。
 * 必须带引号整串比对：裸子串匹配会让 `Input.clear` 被 `TagInput.clear` 误判为已消费
 * （本仓审计时正是这个子串陷阱一度漏掉 2 个悬空键）。
 */
function collectQuotedLiterals(): Set<string> {
  const lits = new Set<string>();
  for (const code of SOURCES) {
    for (const m of code.matchAll(/['"`]([A-Za-z]+\.[A-Za-z_0-9.]+)['"`]/g)) {
      lits.add(m[1]!);
    }
  }
  return lits;
}

/** 语言包的全部叶子键路径。 */
function leafKeys(bundle: Locale): string[] {
  const leaves: string[] = [];
  const walk = (node: unknown, prefix: string): void => {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      leaves.push(prefix);
      return;
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      walk(v, prefix ? `${prefix}.${k}` : k);
    }
  };
  for (const [k, v] of Object.entries(bundle as unknown as Record<string, unknown>)) {
    if (NON_MESSAGE_KEYS.has(k)) continue;
    walk(v, k);
  }
  return leaves;
}

function readPath(bundle: Locale, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined,
      bundle,
    );
}

describe('locale 覆盖闸门', () => {
  const referenced = collectReferencedKeys();

  it('扫到了消费方的 t() 键（防扫描失效后假绿）', () => {
    // 全库有数百个 t() 调用点；若骤降说明 glob 模式或正则改动使扫描失效。
    expect(referenced.length).toBeGreaterThan(200);
  });

  it.each([
    ['zh_CN', zh_CN],
    ['en_US', en_US],
  ])('%s：源码引用的每个键都能解析出真值（不渲染裸 key）', (_name, bundle) => {
    const unresolved = referenced.filter((key) => typeof readPath(bundle, key) !== 'string');
    expect(unresolved).toEqual([]);
  });

  it('语言包里没有零消费的悬空键', () => {
    const literals = collectQuotedLiterals();
    const dangling = leafKeys(zh_CN).filter((key) => {
      if (WHOLE_SLICE_CONSUMERS.has(key.split('.')[0]!)) return false;
      return !literals.has(key);
    });
    expect(dangling).toEqual([]);
  });

  it('zh_CN 与 en_US 键集完全一致', () => {
    const zh = new Set(leafKeys(zh_CN));
    const en = new Set(leafKeys(en_US));
    expect([...zh].filter((k) => !en.has(k))).toEqual([]);
    expect([...en].filter((k) => !zh.has(k))).toEqual([]);
  });
});
