<script lang="ts">
  import { InputGroup, Input } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <InputGroup label="价格区间" size="default">
    <Input ariaLabel="最低价" placeholder="最低" defaultValue="0" />
    <Input ariaLabel="最高价" placeholder="最高" defaultValue="9999" />
  </InputGroup>

  <InputGroup size="large">
    <Input ariaLabel="起始日期" placeholder="起始" />
    <Input ariaLabel="结束日期" placeholder="结束" />
  </InputGroup>
</div>
