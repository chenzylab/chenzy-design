// UserGuide 组件 + a11y 测试（jsdom dom project：文件名 *.a11y.test.ts）。
// 覆盖：role=dialog + aria-modal + labelledby/describedby、进度 aria-label、
// spotlight 矩形随 target、圆点指示器、Esc/←→ 键盘、mask inert、axe 0 violations。
//
// 注意：jsdom 焦点模型不完整，不断言真实焦点移动/trap 行为（那属于 kbd/浏览器套件），
// 只断言静态 ARIA + DOM 结构 + 键盘事件触发的回调。portal 到 body，全局查询。
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tick } from 'svelte';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import UserGuideComponent from './UserGuide.svelte';
import type { UserGuideStep } from './UserGuide.svelte';

// renderWithLocale 接受 Component<Record<string, unknown>>；UserGuide 有必填 prop
// steps，故在 exactOptionalPropertyTypes 下不直接可赋值——这里做一次宽松转型。
const UserGuide = UserGuideComponent as unknown as Component<Record<string, unknown>>;

function makeTarget(id: string): HTMLElement {
  const el = document.createElement('button');
  el.id = id;
  el.textContent = id;
  el.getBoundingClientRect = () =>
    ({ left: 100, top: 50, width: 80, height: 30, right: 180, bottom: 80, x: 100, y: 50, toJSON() {} }) as DOMRect;
  document.body.appendChild(el);
  return el;
}

function popupSteps(): UserGuideStep[] {
  return [
    { target: () => document.getElementById('t1'), title: '第一步', description: '介绍一' },
    { target: () => document.getElementById('t2'), title: '第二步', description: '介绍二' },
    { target: () => document.getElementById('t3'), title: '第三步', description: '介绍三' },
  ];
}

beforeEach(() => {
  document.body.innerHTML = '';
  makeTarget('t1');
  makeTarget('t2');
  makeTarget('t3');
});

describe('UserGuide popup a11y', () => {
  it('role=dialog + aria-modal + labelledby/describedby，进度 aria-label，无 axe violations', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();

    const dialog = document.querySelector('.cd-userguide[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');

    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    expect(document.getElementById(labelledby!)?.textContent).toContain('第一步');

    const describedby = dialog?.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    expect(document.getElementById(describedby!)?.textContent).toContain('介绍一');

    // 进度 aria-label（中文模板 zh_CN 默认或 en_US；renderWithLocale 默认 en_US）
    const progress = document.querySelector('.cd-userguide__progress') as HTMLElement | null;
    expect(progress?.getAttribute('aria-label')).toBeTruthy();
    expect(progress?.getAttribute('aria-label')).toMatch(/1/);

    await expectNoAxeViolations(document.body);
  });

  it('spotlight 矩形随 target getBoundingClientRect + padding', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, spotlightPadding: 10 },
    });
    // 首帧测量延后到宏任务（红线 #3），等 setTimeout(0)
    await new Promise((r) => setTimeout(r, 5));
    await tick();
    const hole = document.querySelector('rect.cd-userguide-hole') as SVGRectElement | null;
    expect(hole).not.toBeNull();
    // target rect: left=100 top=50 w=80 h=30；padding=10 → x=90 y=40 w=100 h=50
    expect(hole?.getAttribute('x')).toBe('90');
    expect(hole?.getAttribute('y')).toBe('40');
    expect(hole?.getAttribute('width')).toBe('100');
    expect(hole?.getAttribute('height')).toBe('50');
  });

  it('svg mask id 唯一（非随机）', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();
    const mask = document.querySelector('mask') as SVGMaskElement | null;
    expect(mask?.id).toMatch(/^cd-userguide-mask-\d+$/);
  });

  it('mask=false 不渲染遮罩 svg', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, mask: false },
    });
    await tick();
    expect(document.querySelector('svg.cd-userguide-mask')).toBeNull();
    // 仍渲染气泡
    expect(document.querySelector('.cd-userguide[role="dialog"]')).not.toBeNull();
  });

  it('Esc 触发 onSkip，←/→ 触发步进', async () => {
    const onSkip = vi.fn();
    const onChange = vi.fn();
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, onSkip, onChange },
    });
    await tick();
    const dialog = document.querySelector('.cd-userguide[role="dialog"]') as HTMLElement;

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await tick();
    expect(onChange).toHaveBeenLastCalledWith(1);

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await tick();
    expect(onChange).toHaveBeenLastCalledWith(0);

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('末步下一步按钮显示完成文案并触发 onFinish', async () => {
    const onFinish = vi.fn();
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, current: 2, onFinish },
    });
    await tick();
    // 受控末步：跳过按钮隐藏、上一步显示
    const buttons = Array.from(document.querySelectorAll('.cd-userguide__actions button'));
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toContain('Finish');
    expect(labels).not.toContain('Skip'); // 末步无跳过
    const finishBtn = buttons.find((b) => b.textContent?.trim() === 'Finish') as HTMLButtonElement;
    finishBtn.click();
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('首步隐藏上一步、显示跳过', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();
    const labels = Array.from(document.querySelectorAll('.cd-userguide__actions button')).map(
      (b) => b.textContent?.trim(),
    );
    expect(labels).toContain('Skip');
    expect(labels).not.toContain('Prev'); // 首步无上一步
    expect(labels).toContain('Next');
  });

  it('visible=false 不渲染', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: false } });
    await tick();
    expect(document.querySelector('.cd-userguide-overlay')).toBeNull();
  });

  it('mask 背景 inert：overlay 挂到 body 后其兄弟节点 inert', async () => {
    const sibling = document.createElement('div');
    sibling.id = 'page-content';
    document.body.appendChild(sibling);
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();
    // useInertBackground 以 overlay 为锚，对兄弟设 inert
    expect(sibling.hasAttribute('inert')).toBe(true);
  });
});

describe('UserGuide modal a11y', () => {
  function modalSteps(): UserGuideStep[] {
    return [
      { title: '欢迎', description: '欢迎语' },
      { title: '功能', description: '功能介绍' },
    ];
  }

  it('mode=modal role=dialog + aria-modal + labelledby，无 axe violations', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: modalSteps(), visible: true, mode: 'modal' },
    });
    await tick();
    const dialog = document.querySelector('.cd-userguide-modal[role="dialog"]') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    const labelledby = dialog?.getAttribute('aria-labelledby');
    expect(document.getElementById(labelledby!)?.textContent).toContain('欢迎');
    await expectNoAxeViolations(document.body);
  });

  it('有 cover 步骤渲染圆点指示器，激活态跟随 current', async () => {
    // 用一个含 cover 的 snippet 触发指示器（hasCover 逻辑：任一步有 cover）。
    const coverSnippet = (() => {}) as unknown as NonNullable<UserGuideStep['cover']>;
    const withCover: UserGuideStep[] = [
      { title: 'A', cover: coverSnippet },
      { title: 'B' },
    ];
    renderWithLocale(UserGuide, {
      props: { steps: withCover, visible: true, mode: 'modal', current: 1 },
    });
    await tick();
    const dots = document.querySelectorAll('.cd-userguide__dot');
    expect(dots.length).toBe(2);
    expect(dots[1]?.classList.contains('cd-userguide__dot--active')).toBe(true);
    expect(dots[0]?.classList.contains('cd-userguide__dot--active')).toBe(false);
  });
});
