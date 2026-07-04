// AudioPlayer a11y + 渲染：基于原生 <audio> 的音频播放器（对齐 Semi）。
//  - 渲染 <audio> + 工具栏（showToolbar 控制）。
//  - 工具栏按钮走 locale 可访问名（play/backward/forward/refresh/volume/speed），非 key 字面量。
//  - 单曲不渲染上/下曲；多曲渲染上/下曲。
//  - 封面/标题渲染。
// jsdom 只断言静态渲染 + ARIA + axe（真实播放/媒体事件留给浏览器；jsdom 无媒体管线）。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import AudioPlayer from './AudioPlayer.svelte';

describe('AudioPlayer a11y / 渲染', () => {
  it('单曲默认渲染：audio + 工具栏，按钮 locale 可访问名，无 axe violations', async () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    // 原生 audio 元素。
    expect(container.querySelector('audio')).not.toBeNull();
    // 工具栏存在。
    expect(container.querySelector('.cd-audio-player__toolbar')).not.toBeNull();
    // 播放按钮 aria-label 走 locale（en_US → 'Play'），非 key 字面量。
    const status = container.querySelector('.cd-audio-player__btn--status');
    const label = status?.getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label).not.toBe('AudioPlayer.play');
    // 单曲：不渲染上/下曲按钮（工具栏含 backward/status/forward/refresh，无 prev/next）。
    const btns = container.querySelectorAll('.cd-audio-player__btn');
    // backward + status + forward + refresh = 4（无 prev/next）。
    expect(btns.length).toBe(4);
    await expectNoAxeViolations(container);
  });

  it('showToolbar=false：不渲染工具栏', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3', showToolbar: false },
    });
    expect(container.querySelector('.cd-audio-player__toolbar')).toBeNull();
    // audio 仍在。
    expect(container.querySelector('audio')).not.toBeNull();
  });

  it('多曲：渲染上/下曲按钮，首曲上一曲 disabled', async () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: {
        audioUrl: [
          { src: '/a.mp3', title: 'A' },
          { src: '/b.mp3', title: 'B' },
        ],
      },
    });
    const btns = container.querySelectorAll('.cd-audio-player__btn');
    // prev + backward + status + forward + next + refresh = 6。
    expect(btns.length).toBe(6);
    // 首曲：prev（第一个按钮）disabled。
    const prev = btns[0] as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    await expectNoAxeViolations(container);
  });

  it('封面 + 标题渲染', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: { src: '/a.mp3', title: '曲名', cover: '/cover.png' } },
    });
    const img = container.querySelector('img.cd-audio-player__cover') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/cover.png');
    expect(container.querySelector('.cd-audio-player__title')?.textContent).toBe('曲名');
  });

  it('theme=light 应用主题 class', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3', theme: 'light' },
    });
    expect(container.querySelector('.cd-audio-player--light')).not.toBeNull();
  });

  it('默认 theme=dark', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    expect(container.querySelector('.cd-audio-player--dark')).not.toBeNull();
  });

  it('进度条为 range + aria slider 语义标注', () => {
    const { container } = renderWithLocale(AudioPlayer, {
      props: { audioUrl: '/a.mp3' },
    });
    const progress = container.querySelector('.cd-audio-player__progress') as HTMLInputElement | null;
    expect(progress).not.toBeNull();
    expect(progress?.getAttribute('type')).toBe('range');
    expect(progress?.getAttribute('aria-valuemin')).toBe('0');
    expect(progress?.getAttribute('aria-valuenow')).not.toBeNull();
  });
});
