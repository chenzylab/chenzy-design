<!--
  Steps a11y 测试夹具：组合式 <Steps><Steps.Step/></Steps>，透传顶层 props（rest 展开避免显式 undefined）。
  三步固定标题，供 a11y.test.ts 断言 ol/li 结构、aria-current、sr-only、button 与 nav 包裹。
-->
<script lang="ts">
  import { Steps } from './index.js';
  import type { StepsType, StepsSize, StepsDirection } from './context.js';
  import type { StepStatus } from './types.js';

  interface Props {
    current?: number;
    type?: StepsType;
    size?: StepsSize;
    direction?: StepsDirection;
    status?: StepStatus;
    onChange?: (current: number) => void;
  }

  const props: Props = $props();
</script>

<Steps {...props}>
  <Steps.Step title="Start" />
  <Steps.Step title="Verify" />
  <Steps.Step title="Done" />
</Steps>
