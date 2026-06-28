<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';

  const data = [
    { label: '姓名', value: '张三' },
    { label: '部门', value: '工程部' },
    { label: '职级', value: 'P6' },
    { label: '入职日期', value: '2022-03-15' },
  ];
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <Descriptions {data} title="水平布局（默认）" />
  <Descriptions {data} title="垂直布局" direction="vertical" />
</div>
