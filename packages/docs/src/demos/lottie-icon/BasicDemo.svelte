<script lang="ts">
  import { LottieIcon, Button, Text } from '@chenzy-design/svelte';
  import type { LottiePlayerFactory } from '@chenzy-design/svelte';

  // mock player：CSS 旋转方块模拟动画播放/暂停
  const mockPlayer: LottiePlayerFactory = ({ container, autoplay, segment, renderer }) => {
    const el = document.createElement('div');
    el.style.cssText =
      'width:100%;height:100%;border-radius:3px;background:var(--cd-color-primary);' +
      'animation:cd-demo-spin 1s linear infinite;animation-play-state:paused';
    container.appendChild(el);
    const setState = (s: string) => (el.style.animationPlayState = s);
    if (segment) container.dataset.segment = `${segment[0]}-${segment[1]}`;
    container.dataset.renderer = renderer ?? 'svg';
    if (autoplay) setState('running');
    return {
      play: () => setState('running'),
      pause: () => setState('paused'),
      stop: () => { setState('paused'); el.style.transform = 'rotate(0deg)'; },
      goToFrame: () => setState('paused'),
      playSegments: (seg) => { container.dataset.segment = `${seg[0]}-${seg[1]}`; setState('running'); },
      destroy: () => el.remove(),
    };
  };

  // src fetch 演示：把内联 JSON 转成 blob URL
  const lottieDemoUrl = URL.createObjectURL(
    new Blob([JSON.stringify({ v: '5.7.0', fr: 30, op: 60 })], { type: 'application/json' }),
  );

  let lottieVisible = $state(true);
</script>

<Text type="tertiary">库不绑定 lottie-web，用户注入 player 工厂；此处用 mock player 演示</Text>

<div style="display:flex; gap:32px; align-items:center; margin-top:8px">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" decorative={false} label="自动播放" />
    <Text type="tertiary">auto（自动播放）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" trigger="hover" decorative={false} label="悬停播放" />
    <Text type="tertiary">hover（悬停播放）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" reducedMotion decorative={false} label="降级静止" />
    <Text type="tertiary">reducedMotion（静止）</Text>
  </div>
</div>

<div style="display:flex; gap:32px; align-items:center; margin-top:16px">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon src={lottieDemoUrl} player={mockPlayer} size="large" decorative={false} label="远程加载" />
    <Text type="tertiary">src（URL 异步 fetch）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" segments={[10, 60]} decorative={false} label="帧段播放" />
    <Text type="tertiary">segments（[10,60] 帧段）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" flipRtl decorative={false} label="RTL 镜像" />
    <Text type="tertiary">flipRtl（水平镜像）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon src="https://invalid.invalid/nope.json" player={mockPlayer} size="large" decorative={false} label="加载失败" />
    <Text type="tertiary">src 失败（error 态）</Text>
  </div>
</div>

<div style="display:flex; gap:32px; align-items:center; margin-top:16px">
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" canvas decorative={false} label="canvas 渲染" />
    <Text type="tertiary">canvas（renderer=canvas）</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:4px">
    <LottieIcon data={{}} player={mockPlayer} size="large" renderer="html" decorative={false} label="html 渲染" />
    <Text type="tertiary">renderer="html"</Text>
  </div>
  <div style="display:flex; flex-direction:column; align-items:center; gap:8px">
    <div style="display:flex; gap:8px; align-items:center">
      <LottieIcon data={{}} player={mockPlayer} size="large" visible={lottieVisible} decorative={false} label="受控显隐" />
      <Button size="small" onclick={() => (lottieVisible = !lottieVisible)}>
        {lottieVisible ? '隐藏' : '显示'}
      </Button>
    </div>
    <Text type="tertiary">visible（受控显隐 + 暂停）</Text>
  </div>
</div>

<style>
  @keyframes -global-cd-demo-spin {
    to { transform: rotate(360deg); }
  }
</style>
