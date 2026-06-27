<script lang="ts">
  import { Button } from '@chenzy-design/svelte';

  const {
    type = 'primary',
    theme = 'solid',
    size = 'default',
    disabled = false,
  }: {
    type?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger';
    theme?: 'solid' | 'borderless' | 'light' | 'outline';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
  } = $props();
</script>

<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
  <Button {type} {theme} {size} {disabled}>按钮</Button>
  <Button {type} theme="light" {size} {disabled}>浅色</Button>
  <Button {type} theme="borderless" {size} {disabled}>无边框</Button>
  <Button {type} theme="outline" {size} {disabled}>描边</Button>
</div>
