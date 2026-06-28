<script lang="ts">
  import { Icon } from '@chenzy-design/svelte';
</script>

<div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
  <Icon status="default">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  </Icon>
  <Icon status="info">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  </Icon>
  <Icon status="success">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  </Icon>
  <Icon status="warning">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  </Icon>
  <Icon status="error">
    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
  </Icon>
  <Icon spin>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
    </svg>
  </Icon>
</div>
