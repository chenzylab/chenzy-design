<script lang="ts">
  import { Rating } from '@chenzy-design/svelte';
</script>

<div>
  <span>允许再次点击清除</span>
  <br />
  <Rating allowClear={true} defaultValue={3} />
  <br />
  <br />
  <span>禁止再次点击清除</span>
  <br />
  <Rating allowClear={false} defaultValue={3} />
</div>
