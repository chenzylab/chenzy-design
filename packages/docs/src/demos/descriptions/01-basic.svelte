<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';

  const data = [
    { label: '用户名', value: 'bytegolang' },
    { label: '邮箱', value: 'hello@example.com' },
    { label: '手机', value: '138****8888' },
    { label: '城市', value: '上海' },
    { label: '注册时间', value: '2024-01-01' },
    { label: '状态', value: '正常' },
  ];
</script>

<Descriptions {data} />
