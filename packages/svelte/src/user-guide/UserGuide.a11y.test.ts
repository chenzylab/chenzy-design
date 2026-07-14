// UserGuide 组件 + a11y 测试（jsdom dom project：文件名 *.a11y.test.ts）。
// 严格对齐 Semi userGuide：DOM 结构（popup-content / modal / spotlight）、指示器文本 n/total、
// 圆点指示器、按钮显隐规则、axe 0 violations。Semi 无 focus-trap/inert/Esc/键盘/role=dialog，
// 故不测这些（popup 的 role=dialog 由本库 Popover 对 trigger="custom" 自带，属 Popover 契约）。
// portal 到 body，全局查询。
import { describe, it, expect, beforeEach } from 'vitest';
import { tick } from 'svelte';
import type { Component } from 'svelte';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import UserGuideComponent from './UserGuide.svelte';
import type { UserGuideStep } from './UserGuide.svelte';

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

describe('UserGuide popup', () => {
  it('渲染 popup-content 结构（title/description/indicator/buttons），无 axe violations', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();

    const content = document.querySelector('.cd-userGuide-popup-content');
    expect(content).not.toBeNull();
    expect(document.querySelector('.cd-userGuide-popup-content-title')?.textContent).toContain('第一步');
    expect(document.querySelector('.cd-userGuide-popup-content-description')?.textContent).toContain('介绍一');

    // 指示器为纯文本 n/total（对齐 Semi，无 i18n / 无 aria-label）
    const indicator = document.querySelector('.cd-userGuide-popup-content-indicator');
    expect(indicator?.textContent?.replace(/\s/g, '')).toBe('1/3');

    await expectNoAxeViolations(document.body);
  });

  it('spotlight 矩形随 target getBoundingClientRect + padding', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, spotlightPadding: 10 },
    });
    // updateSpotlightRect 在 rAF 内 setState
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await tick();
    const hole = document.querySelector('rect.cd-userGuide-spotlight-rect') as SVGRectElement | null;
    expect(hole).not.toBeNull();
    // target rect: left=100 top=50 w=80 h=30；padding=10 → x=90 y=40 w=100 h=50
    expect(hole?.getAttribute('x')).toBe('90');
    expect(hole?.getAttribute('y')).toBe('40');
    expect(hole?.getAttribute('width')).toBe('100');
    expect(hole?.getAttribute('height')).toBe('50');
  });

  it('mask=false 不渲染遮罩 rect（仍渲染 spotlight svg 供定位）', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, mask: false },
    });
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await tick();
    // mask=false → 无遮罩/透明 rect（对齐 Semi：mask && (...) 分支不渲染）
    expect(document.querySelector('.cd-userGuide-spotlight-transparent-rect')).toBeNull();
    // 仍渲染气泡内容
    expect(document.querySelector('.cd-userGuide-popup-content')).not.toBeNull();
  });

  it('末步下一步按钮显示完成文案，隐藏跳过', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: popupSteps(), visible: true, current: 2 },
    });
    await tick();
    const buttons = Array.from(
      document.querySelectorAll('.cd-userGuide-popup-content-buttons button'),
    );
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toContain('Finish');
    expect(labels).not.toContain('Skip'); // 末步无跳过
    expect(labels).toContain('Prev'); // 末步有上一步
  });

  it('首步隐藏上一步、显示跳过', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: true } });
    await tick();
    const labels = Array.from(
      document.querySelectorAll('.cd-userGuide-popup-content-buttons button'),
    ).map((b) => b.textContent?.trim());
    expect(labels).toContain('Skip');
    expect(labels).not.toContain('Prev'); // 首步无上一步
    expect(labels).toContain('Next');
  });

  it('visible=false 不渲染', async () => {
    renderWithLocale(UserGuide, { props: { steps: popupSteps(), visible: false } });
    await tick();
    expect(document.querySelector('.cd-userGuide-popup-content')).toBeNull();
    expect(document.querySelector('.cd-userGuide-spotlight')).toBeNull();
  });
});

describe('UserGuide modal', () => {
  function modalSteps(): UserGuideStep[] {
    return [
      { title: '欢迎', description: '欢迎语' },
      { title: '功能', description: '功能介绍' },
    ];
  }

  it('mode=modal 渲染 modal-body 结构，无 axe violations', async () => {
    renderWithLocale(UserGuide, {
      props: { steps: modalSteps(), visible: true, mode: 'modal' },
    });
    await tick();
    expect(document.querySelector('.cd-userGuide-modal-body-title')?.textContent).toContain('欢迎');
    expect(document.querySelector('.cd-userGuide-modal-body-description')?.textContent).toContain('欢迎语');
    await expectNoAxeViolations(document.body);
  });

  it('有 cover 步骤渲染圆点指示器，激活态跟随 current', async () => {
    const coverSnippet = (() => {}) as unknown as NonNullable<UserGuideStep['cover']>;
    const withCover: UserGuideStep[] = [
      { title: 'A', cover: coverSnippet },
      { title: 'B', cover: coverSnippet },
    ];
    renderWithLocale(UserGuide, {
      props: { steps: withCover, visible: true, mode: 'modal', current: 1 },
    });
    await tick();
    const dots = document.querySelectorAll('.cd-userGuide-modal-indicator-item');
    expect(dots.length).toBe(2);
    expect(dots[1]?.classList.contains('cd-userGuide-modal-indicator-item-active')).toBe(true);
    expect(dots[0]?.classList.contains('cd-userGuide-modal-indicator-item-active')).toBe(false);
  });
});
