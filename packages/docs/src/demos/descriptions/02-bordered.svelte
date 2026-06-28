<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';

  const data = [
    { label: '产品名称', value: 'Chenzy Design' },
    { label: '版本', value: '1.0.0' },
    { label: '许可证', value: 'MIT' },
    { label: '发布日期', value: '2024-06-01' },
  ];
</script>

<Descriptions {data} bordered title="项目信息" />
