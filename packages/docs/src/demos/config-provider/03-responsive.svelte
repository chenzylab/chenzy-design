<script lang="ts">
  // 严格复刻 Semi「开启监听与自定义断点」：responsiveObserve 开启断点监听，
  // responsiveMap 自定义断点（值与 Semi demo 逐字一致）。
  // 定义在组件外（模块级）保证引用稳定 —— responsiveMap 是引用比较，
  // inline 写对象会被识别为变化并重新注册全部监听（对齐 Semi 注意事项）。
  import { ConfigProvider } from '@chenzy-design/svelte';
  import BreakpointView from './BreakpointView.svelte';

  const responsiveMap = {
    xs: '(max-width: 575px)',
    sm: '(min-width: 576px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 992px)',
    xl: '(min-width: 1200px)',
    xxl: '(min-width: 1600px)',
  };
</script>

<ConfigProvider responsiveObserve {responsiveMap}>
  <BreakpointView />
</ConfigProvider>
