<!--
  仅供 UserGuide.metrics.kbd.test.ts（browser project）使用的真机几何测量夹具。
  复刻 Semi 官方 UserGuide 文档「基本用法」demo 的真实交互模式：目标元素先渲染稳定，
  用户点击按钮后 visible 才从 false→true（对齐 docs 站 demo 与真实业务用法——目标
  元素与引导浮层不是同批次挂载）。用于验证浮层是否精确对齐 target，不依赖 jsdom
  无法可靠模拟的真实布局引擎与渲染管线时序。
-->
<script lang="ts">
  import { LocaleProvider } from '../locale-provider/index.js';
  import UserGuide from './UserGuide.svelte';
  import type { UserGuideStep } from './UserGuide.svelte';

  let el1 = $state<HTMLElement | null>(null);
  let el2 = $state<HTMLElement | null>(null);
  let el3 = $state<HTMLElement | null>(null);
  let visible = $state(false);

  const steps: UserGuideStep[] = [
    { target: () => el1, title: 'Switch', description: 'target-1', position: 'bottom' },
    { target: () => el2, title: 'Tag', description: 'target-2', position: 'bottom' },
    { target: () => el3, title: 'Button', description: 'target-3', position: 'bottom' },
  ];
</script>

<LocaleProvider locale="en_US">
  <button data-testid="start-guide" onclick={() => (visible = true)}>开始引导</button>
  <div style="display:flex; gap:24px; align-items:center; padding:24px;">
    <span bind:this={el1} style="display:inline-block; width:36px; height:20px; background:green;" data-testid="target-1"></span>
    <span bind:this={el2} style="display:inline-block; width:90px; height:24px; background:grey;" data-testid="target-2">Default Tag</span>
    <span bind:this={el3} style="display:inline-block; width:56px; height:32px; background:blue;" data-testid="target-3">确定</span>
  </div>
  <UserGuide mode="popup" mask={true} {visible} {steps} />
</LocaleProvider>
