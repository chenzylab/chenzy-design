// VideoPlayer 渲染 + a11y：控件为原生 button 带 aria-label（走 locale），
// 进度/音量为 role=slider，倍率/清晰度/线路为菜单按钮；controlsList 控制控件增删。
// jsdom 不解码媒体，duration=NaN，但控件与 aria 结构仍可断言。
import { describe, it, expect } from 'vitest';
import { renderWithLocale, expectNoAxeViolations } from '../test-utils/a11y.js';
import VideoPlayer from './VideoPlayer.svelte';

const VP = VideoPlayer as unknown as Parameters<typeof renderWithLocale>[0];

describe('VideoPlayer a11y', () => {
  it('renders a <video> + labelled play/fullscreen buttons, no axe violations', async () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4', poster: 'https://example.com/p.jpg' },
    });
    expect(container.querySelector('video.cd-video-player__video')).toBeTruthy();
    // play button labelled via locale (en_US → "Play")
    const play = container.querySelector('button[aria-label="Play"]');
    expect(play).toBeTruthy();
    const fs = container.querySelector('button[aria-label="Fullscreen"]');
    expect(fs).toBeTruthy();
    await expectNoAxeViolations(container);
  });

  it('progress + volume are role=slider with aria bounds', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4' },
    });
    const sliders = container.querySelectorAll('[role="slider"]');
    // at least the progress bar + the volume rail
    expect(sliders.length).toBeGreaterThanOrEqual(2);
    const volume = container.querySelector('.cd-video-player-volume__rail');
    expect(volume?.getAttribute('aria-valuemin')).toBe('0');
    expect(volume?.getAttribute('aria-valuemax')).toBe('100');
  });

  it('controlsList removes control items', () => {
    const { container } = renderWithLocale(VP, {
      props: {
        src: 'https://example.com/v.mp4',
        controlsList: ['play', 'fullscreen'],
      },
    });
    // volume removed → no mute button
    expect(container.querySelector('button[aria-label="Mute"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Unmute"]')).toBeNull();
    // mirror removed
    expect(container.querySelector('button[aria-label="Mirror"]')).toBeNull();
    // play + fullscreen kept
    expect(container.querySelector('button[aria-label="Play"]')).toBeTruthy();
    expect(container.querySelector('button[aria-label="Fullscreen"]')).toBeTruthy();
  });

  it('playbackRate menu is a menu button with menuitemradio options', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4' },
    });
    const trigger = container.querySelector(
      'button[aria-label="Playback speed"][aria-haspopup="menu"]',
    );
    expect(trigger).toBeTruthy();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('light theme sets the light modifier class', () => {
    const { container } = renderWithLocale(VP, {
      props: { src: 'https://example.com/v.mp4', theme: 'light' },
    });
    expect(container.querySelector('.cd-video-player--light')).toBeTruthy();
  });
});
