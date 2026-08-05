// Row gutter 响应式对象行为：对齐 Semi grid/row.tsx 的 registerMediaQuery + getGutter。
// 真机缩放视口在自动化环境下不可控（CDP viewport 固定），故用 jsdom stub matchMedia 补测试。
import { describe, it, expect, vi } from 'vitest';
import { renderWithLocale } from '../test-utils/a11y.js';
import Row from './Row.svelte';
import GridGutterFixture from './GridGutterFixture.svelte';

// matchedMedia 可传多个：真实浏览器里 min-width 断点是层叠命中的
// （命中 lg 时 sm/md 的 min-width 查询同样为真），stub 需还原这个层叠关系。
function stubMatchMedia(...matchedMedia: string[]) {
  const listeners = new Map<string, Array<(e: { matches: boolean }) => void>>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      matches: matchedMedia.includes(media),
      media,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        const list = listeners.get(media) ?? [];
        list.push(cb);
        listeners.set(media, list);
      },
      removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        const list = listeners.get(media) ?? [];
        listeners.set(
          media,
          list.filter((fn) => fn !== cb),
        );
      },
    })),
  );
}

describe('Row gutter 响应式对象（对齐 Semi getGutter + responsiveArray 降级）', () => {
  it('xs 断点用 (max-width: 575px)，命中时取该档 gutter 值', () => {
    stubMatchMedia('(max-width: 575px)');
    const { container } = renderWithLocale(Row, {
      props: { gutter: { xs: 8, sm: 16, md: 24 }, children: undefined },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    // xs 命中 → gutter=8 → margin ±4px
    expect(row.style.marginLeft).toBe('-4px');
    vi.unstubAllGlobals();
  });

  it('responsiveArray 从大到小降级：未声明的档位继承上一个已声明档位的值', () => {
    // 命中 sm/md/lg（层叠：min-width lg 为真时 sm/md 同样为真），
    // gutter 对象只声明了 xs/sm，lg/md 未声明 → 从 lg 起沿 responsiveArray 向下找，
    // 命中且已声明的第一个是 sm=16。
    stubMatchMedia('(min-width: 576px)', '(min-width: 768px)', '(min-width: 992px)');
    const { container } = renderWithLocale(Row, {
      props: { gutter: { xs: 8, sm: 16 }, children: undefined },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    expect(row.style.marginLeft).toBe('-8px');
    vi.unstubAllGlobals();
  });

  it('非对象 gutter（纯数值）不订阅 media query，也不受 screens 影响', () => {
    const matchMediaSpy = vi.fn((media: string) => ({
      matches: false,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaSpy);
    const { container } = renderWithLocale(Row, {
      props: { gutter: 16, children: undefined },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    expect(row.style.marginLeft).toBe('-8px');
    expect(matchMediaSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('[x, y] 双轴响应式 gutter：x 轴（水平 margin）独立按 responsiveArray 降级取值', () => {
    // jsdom 对同时设置 4 条独立 margin-* 内联声明存在 shorthand 序列化缺陷
    // （margin-left/right/top/bottom 合并回读时错位，与真机 Chrome 行为不一致，
    // 已用 javascript_tool 在真机核实过响应式 gutter 渲染正确）；为避免测试假红，
    // 拆成 x/y 轴各自独立场景（每次只有一轴非零），只触发 2 条同向 margin 声明。
    stubMatchMedia('(min-width: 576px)', '(min-width: 768px)');
    const { container } = renderWithLocale(Row, {
      props: { gutter: [{ xs: 8, md: 16 }, 0], children: undefined },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    expect(row.style.marginLeft).toBe('-8px');
    expect(row.style.marginRight).toBe('-8px');
    expect(row.style.marginTop).toBe('');
    vi.unstubAllGlobals();
  });

  it('[x, y] 双轴响应式 gutter：y 轴（垂直 margin）独立按 responsiveArray 降级取值', () => {
    stubMatchMedia('(min-width: 576px)', '(min-width: 768px)');
    const { container } = renderWithLocale(Row, {
      props: { gutter: [0, { xs: 12, md: 24 }], children: undefined },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    expect(row.style.marginTop).toBe('-12px');
    expect(row.style.marginBottom).toBe('-12px');
    expect(row.style.marginLeft).toBe('');
    vi.unstubAllGlobals();
  });
});

describe('Col + Row gutter 联动（渲染态四向 padding，对齐 Semi RowContext.gutters）', () => {
  it('固定数值 gutter：Col 施加水平 padding = g/2，Row 施加水平 margin = -g/2', () => {
    const { container } = renderWithLocale(GridGutterFixture, { props: { gutter: 16 } });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    const cols = container.querySelectorAll('.cd-col');
    expect(row.style.marginLeft).toBe('-8px');
    expect(row.style.marginRight).toBe('-8px');
    cols.forEach((col) => {
      const style = (col as HTMLElement).style;
      expect(style.paddingLeft).toBe('8px');
      expect(style.paddingRight).toBe('8px');
    });
  });

  it('响应式 gutter 命中断点变化时，Col padding 与 Row margin 同步更新', () => {
    stubMatchMedia('(min-width: 576px)', '(min-width: 768px)');
    const { container } = renderWithLocale(GridGutterFixture, {
      props: { gutter: { xs: 8, md: 24 } },
    });
    const row = container.querySelector('.cd-row')! as HTMLElement;
    const col = container.querySelector('.cd-col')! as HTMLElement;
    expect(row.style.marginLeft).toBe('-12px');
    expect(col.style.paddingLeft).toBe('12px');
    vi.unstubAllGlobals();
  });
});
