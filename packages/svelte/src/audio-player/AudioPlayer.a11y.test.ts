// AudioPlayer a11y + 渲染：基于原生 <audio> 的音频播放器（严格对齐 Semi）。
//  - DOM 单行布局镜像 Semi：.cd-audio-player.-{theme} > audio + control + info-container + control(toolbar)。
//  - 复用 Button/Dropdown/Popover/Tooltip/Image + 具名图标；showToolbar 控制工具栏。
//  - 单曲不渲染上/下曲；多曲渲染（取模循环，无边界 disabled——对齐 Semi）。
//  - 封面用 Image（width=50/height=50）；标题渲染在 -info-title。
// jsdom 只断言静态渲染 + ARIA + axe（真实播放/媒体事件留给浏览器；jsdom 无媒体管线）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AudioPlayer from './AudioPlayer.svelte';

describe('AudioPlayer a11y / 渲染', () => {
  it('单曲默认渲染：audio + 根 dark 主题 + 工具栏，无 axe violations', async () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    // 原生 audio 元素。
    expect(container.querySelector('audio')).not.toBeNull();
    // 根节点 + dark 主题 class（对齐 Semi -{theme}）。
    expect(container.querySelector('.cd-audio-player')).not.toBeNull();
    expect(container.querySelector('.cd-audio-player-dark')).not.toBeNull();
    // 播放/暂停按钮（-control-button-play）存在。
    expect(container.querySelector('.cd-audio-player-control-button-play')).not.toBeNull();
    // 工具栏（含倍速块 -control-speed）存在。
    expect(container.querySelector('.cd-audio-player-control-speed')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('showToolbar=false：不渲染工具栏（无倍速块），audio 仍在', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3', showToolbar: false },
    });
    expect(container.querySelector('.cd-audio-player-control-speed')).toBeNull();
    expect(container.querySelector('audio')).not.toBeNull();
  });

  it('单曲：不渲染上/下曲按钮（无 -info-title 外的 Tooltip 触发的 prev/next）', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    // 单曲控制区仅播放按钮（无上/下曲）。renderControl 只含 1 个 -control-button-play。
    const controls = container.querySelectorAll('.cd-audio-player-control');
    // 至少一个控制区（播放）；单曲播放控制区内按钮数 = 1（仅 play）。
    expect(controls.length).toBeGreaterThanOrEqual(1);
    const playControl = controls[0]!;
    const buttons = playControl.querySelectorAll('button');
    expect(buttons.length).toBe(1);
  });

  it('多曲：渲染上/下曲按钮（播放控制区含 3 按钮：prev/play/next）', async () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: {
        audioUrl: [
          { src: '/a.mp3', title: 'A' },
          { src: '/b.mp3', title: 'B' },
        ],
      },
    });
    const controls = container.querySelectorAll('.cd-audio-player-control');
    const playControl = controls[0]!;
    // prev + play + next = 3（对齐 Semi 多曲 renderControl）。
    expect(playControl.querySelectorAll('button').length).toBe(3);
    await expectNoAxeViolations(container);
  });

  it('封面用 Image（width/height=50）+ 标题渲染', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: { src: '/a.mp3', title: '曲名', cover: '/cover.png' } },
    });
    // 封面经本库 Image 组件渲染（含 img[src]）。
    const img = container.querySelector('img') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/cover.png');
    // 标题在 -info-title。
    expect(container.querySelector('.cd-audio-player-info-title')?.textContent).toContain('曲名');
  });

  it('theme=light 应用主题 class（对齐 Semi -light）', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3', theme: 'light' },
    });
    expect(container.querySelector('.cd-audio-player-light')).not.toBeNull();
  });

  it('进度条为自建 AudioSlider（role=slider + aria 语义标注）', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    // 进度容器内含自建 slider（role=slider）。
    const sliderContainer = container.querySelector('.cd-audio-player-slider-container');
    expect(sliderContainer).not.toBeNull();
    const slider = sliderContainer?.querySelector('[role="slider"]') as HTMLElement | null;
    expect(slider).not.toBeNull();
    expect(slider?.getAttribute('aria-valuemin')).toBe('0');
    expect(slider?.getAttribute('aria-valuenow')).not.toBeNull();
    expect(slider?.getAttribute('aria-orientation')).toBe('horizontal');
  });
});
