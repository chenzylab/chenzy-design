// Progress a11y：role=progressbar + aria-valuenow/min/max；支持 valuetext/label/labelledby。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import Progress from './Progress.svelte';

describe('Progress a11y', () => {
  it('line：role=progressbar + aria-valuenow，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 42, 'aria-label': 'Upload progress' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute('aria-valuenow')).toBe('42');
    expect(bar?.getAttribute('aria-valuemin')).toBe('0');
    expect(bar?.getAttribute('aria-valuemax')).toBe('100');
    expect(bar?.getAttribute('aria-label')).toBe('Upload progress');
    await expectNoAxeViolations(container);
  });

  it('circle：role=progressbar，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { type: 'circle', percent: 70, 'aria-label': 'Task' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('70');
    await expectNoAxeViolations(container);
  });

  it('aria-valuetext 透传，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 80, 'aria-label': 'Disk', 'aria-valuetext': 'Step 2: copying' },
    });
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuetext')).toBe('Step 2: copying');
    await expectNoAxeViolations(container);
  });

  it('aria-labelledby 关联外部标签，无 axe violations', async () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 30, 'aria-labelledby': 'progressbar-label' },
    });
    const label = document.createElement('p');
    label.id = 'progressbar-label';
    label.textContent = 'Disk Usage';
    container.prepend(label);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-labelledby')).toBe('progressbar-label');
    await expectNoAxeViolations(container);
  });
});

// DOM 结构 / 几何 严格对齐 Semi（替代真机截图的结构化验证）。
describe('Progress DOM 对齐 Semi', () => {
  it('line horizontal：cd-progress-horizontal > track > track-inner，宽度=percent%', () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 60, 'aria-label': 'p' },
    });
    const root = container.querySelector('.cd-progress');
    expect(root?.classList.contains('cd-progress-horizontal')).toBe(true);
    const inner = container.querySelector('.cd-progress-track > .cd-progress-track-inner') as HTMLElement;
    expect(inner).not.toBeNull();
    expect(inner.style.width).toBe('60%');
  });

  it('line vertical + large：cd-progress-vertical/-large，高度=percent%', () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 40, direction: 'vertical', size: 'large', 'aria-label': 'p' },
    });
    const root = container.querySelector('.cd-progress');
    expect(root?.classList.contains('cd-progress-vertical')).toBe(true);
    expect(root?.classList.contains('cd-progress-large')).toBe(true);
    const inner = container.querySelector('.cd-progress-track-inner') as HTMLElement;
    expect(inner.style.height).toBe('40%');
  });

  it('circle：svg + track/inner circle，dashoffset=(1-percent/100)·circumference', () => {
    const { container } = renderWithLocale(Progress, {
      props: { type: 'circle', percent: 50, 'aria-label': 'p' },
    });
    expect(container.querySelector('svg.cd-progress-circle-ring')).not.toBeNull();
    const inner = container.querySelector('.cd-progress-circle-ring-inner') as SVGCircleElement;
    expect(inner).not.toBeNull();
    // default width 72, strokeWidth 4 → r=34, C=2π·34；50% → offset=C/2
    const r = (72 - 4) / 2;
    const c = r * 2 * Math.PI;
    expect(Number(inner.getAttribute('stroke-dashoffset'))).toBeCloseTo(c / 2, 3);
    expect(inner.getAttribute('r')).toBe(String(r));
  });

  it('circle default width=72 / small width=24；small 不显示中心文本', () => {
    const def = renderWithLocale(Progress, {
      props: { type: 'circle', percent: 30, showInfo: true, 'aria-label': 'p' },
    });
    expect(def.container.querySelector('svg')?.getAttribute('width')).toBe('72');
    expect(def.container.querySelector('.cd-progress-circle-text')).not.toBeNull();

    const sm = renderWithLocale(Progress, {
      props: { type: 'circle', size: 'small', percent: 30, showInfo: true, 'aria-label': 'p' },
    });
    expect(sm.container.querySelector('svg')?.getAttribute('width')).toBe('24');
    // size=small 不渲染中心文本（对齐 Semi）
    expect(sm.container.querySelector('.cd-progress-circle-text')).toBeNull();
  });

  it('showInfo=false 隐藏信息区；format 自定义文本', () => {
    const off = renderWithLocale(Progress, { props: { percent: 50, 'aria-label': 'p' } });
    expect(off.container.querySelector('.cd-progress-line-text')).toBeNull();

    const fmt = renderWithLocale(Progress, {
      props: { percent: 50, showInfo: true, format: (p: number) => `${p} days`, 'aria-label': 'p' },
    });
    expect(fmt.container.querySelector('.cd-progress-line-text')?.textContent?.trim()).toBe('50 days');
  });

  it('strokeWidth / strokeLinecap / orbitStroke 透传到 circle', () => {
    const { container } = renderWithLocale(Progress, {
      props: {
        type: 'circle',
        percent: 50,
        strokeWidth: 8,
        strokeLinecap: 'square',
        orbitStroke: 'rgb(0, 0, 0)',
        'aria-label': 'p',
      },
    });
    const track = container.querySelector('.cd-progress-circle-ring-track') as SVGCircleElement;
    const inner = container.querySelector('.cd-progress-circle-ring-inner') as SVGCircleElement;
    expect(inner.getAttribute('stroke-width')).toBe('8');
    expect(inner.getAttribute('stroke-linecap')).toBe('square');
    expect(track.getAttribute('style')).toContain('rgb(0, 0, 0)');
  });

  it('stroke 数组按 percent 区间取色（line inner background）', () => {
    const strokeArr = [
      { percent: 20, color: '#ff0000' },
      { percent: 80, color: '#00ff00' },
    ];
    const { container } = renderWithLocale(Progress, {
      props: { percent: 50, stroke: strokeArr, 'aria-label': 'p' },
    });
    const inner = container.querySelector('.cd-progress-track-inner') as HTMLElement;
    // 50 落在 [20,80) 非渐变 → 取下锚点红（浏览器规范化 #ff0000ff → rgb(255, 0, 0)）
    expect(inner.style.background).toBe('rgb(255, 0, 0)');
  });

  it('id / class / style 透传到根节点', () => {
    const { container } = renderWithLocale(Progress, {
      props: { percent: 50, id: 'p1', class: 'my-prog', style: 'height: 8px', 'aria-label': 'p' },
    });
    const root = container.querySelector('.cd-progress') as HTMLElement;
    expect(root.id).toBe('p1');
    expect(root.classList.contains('my-prog')).toBe(true);
    expect(root.style.height).toBe('8px');
  });
});
