// 架构约束守卫：use:floating 用 transform: translate() 定位浮层（写 inline style）。
// 若组件的进场/退场 @keyframes 也动画 transform（如 transform: scale()），CSS 动画的
// transform 会覆盖 floating 写入的定位 transform，把浮层拉到 (0,0) 左上角。
//
// 曾坑：Popover / Popconfirm 的 cd-*-in 关键帧用 transform: scale(.96→1)，导致 hover
// 浮层（尤其 destroyOnClose=false 保持挂载态）定位失效钉在左上角。修复：进场缩放改用
// 独立 `scale` 属性（与 transform 正交，二者叠加不互相覆盖）。
//
// 此测试扫描所有 use:floating 组件源码，断言其 @keyframes 块内不含 transform: scale/translate，
// 防止未来任何浮层组件重蹈覆辙。淡入用 opacity、缩放用独立 scale 属性即可。
import { describe, it, expect } from 'vitest';

// 全量 .svelte 源码（vite raw 导入，无需 node fs / @types/node）。
// import.meta.glob 是 vite 运行时能力；svelte 包 tsconfig 无 vite/client 类型，故此处
// 经 unknown 桥接取用（vitest 运行时由 vite 提供）。
const sources = (
  import.meta as unknown as {
    glob: (
      pattern: string,
      opts: { eager: true; query: '?raw'; import: 'default' },
    ) => Record<string, string>;
  }
).glob('../**/*.svelte', { eager: true, query: '?raw', import: 'default' });

// 提取所有 @keyframes { ... } 块体（大括号配平）。
function keyframeBlocks(src: string): string[] {
  const blocks: string[] = [];
  const re = /@keyframes[^{]*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < src.length && depth > 0) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    blocks.push(src.slice(start, i));
  }
  return blocks;
}

describe('floating 定位组件的动画约束', () => {
  it('use:floating 组件的 @keyframes 不得动画 transform（会覆盖定位）', () => {
    const offenders: string[] = [];
    for (const [path, src] of Object.entries(sources)) {
      if (!src.includes('use:floating')) continue;
      for (const block of keyframeBlocks(src)) {
        if (/transform:\s*(scale|translate)/.test(block)) {
          offenders.push(path);
          break;
        }
      }
    }
    expect(
      offenders,
      `以下 use:floating 组件在 @keyframes 里动画了 transform，会覆盖浮层定位（改用独立 scale 属性）：\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
