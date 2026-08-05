<script lang="ts">
  import { Resizable } from '@chenzy-design/svelte';

  // boundElement="parent"：伸缩框不能超出父容器边界。
</script>

<div
  style="width: 300px; height: 300px; max-width: 100%; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); box-sizing: border-box;"
>
  <Resizable
    defaultSize={{ width: '60%', height: 200 }}
    boundElement="parent"
    style="margin-left: 20%; border: 1px solid var(--cd-color-border); border-radius: var(--cd-border-radius-medium); background: var(--cd-color-fill-0);"
  >
    <div style="margin-left: 20%; font-size: 14px; color: var(--cd-color-text-1);">bound：parent</div>
  </Resizable>
</div>
