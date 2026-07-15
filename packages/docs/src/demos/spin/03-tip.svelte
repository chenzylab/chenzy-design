<script lang="ts">
  import { Spin } from '@chenzy-design/svelte';
</script>

<div>
  <Spin tip="I am loading...">
    <div
      style="border:1px solid var(--cd-color-primary); border-radius:4px; padding-left:8px"
    >
      <p>Here are some texts.</p>
      <p>And more texts on the way.</p>
    </div>
  </Spin>
</div>
