<script lang="ts">
  import { ConfigProvider, Text } from '@chenzy-design/svelte';
  import BreakpointView from './BreakpointView.svelte';

  // 对齐 Semi 响应式断点监听：responsiveObserve 开启后，子组件经 onBreakpoint 订阅断点变化。
  // responsiveMap 定义在组件外以保证引用稳定（inline 新对象会触发重注册）。
  const responsiveMap = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
  };
</script>

<Text type="tertiary"
  >开启 <code>responsiveObserve</code> 后，子组件经 <code>onBreakpoint</code>
  订阅断点变化；缩放窗口宽度观察命中断点更新（默认 false 时不注册任何 matchMedia）。</Text
>

<div style="margin-top:12px">
  <ConfigProvider responsiveObserve {responsiveMap}>
    <BreakpointView />
  </ConfigProvider>
</div>
