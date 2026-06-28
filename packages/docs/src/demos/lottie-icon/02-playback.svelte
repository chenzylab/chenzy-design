<script lang="ts">
  import { LottieIcon, Text } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory } from '@chenzy-design/svelte';

  // mock player：CSS 旋转方块模拟动画；speed 控制旋转周期
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay, speed = 1 }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      `animation:cd-lottie-spin ${1 / speed}s linear infinite;animation-play-state:paused`;
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => { setState('paused'); },
      goToFrame: () => setState('paused'),
      playSegments: () => setState('running'),
      destroy: () => el.remove(),
    };
  };
</script>

<div style="display:flex; gap:32px; align-items:center">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" autoplay loop decorative={false} label="自动循环" />
    <Text type="tertiary">autoplay + loop</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" speed={0.5} decorative={false} label="慢速" />
    <Text type="tertiary">speed=0.5</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" speed={2} decorative={false} label="快速" />
    <Text type="tertiary">speed=2</Text>
  </div>
</div>

<style>
  @keyframes -global-cd-lottie-spin {
    to { transform: rotate(360deg); }
  }
</style>
