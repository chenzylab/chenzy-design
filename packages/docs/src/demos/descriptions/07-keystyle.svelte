<script lang="ts">
  import { Descriptions } from '@chenzy-design/svelte';

  const data = [
    { key: '用户名', value: '张三', keyStyle: 'width: 100px; text-align: right;' },
    { key: '电子邮箱', value: 'zhangsan@example.com', keyStyle: 'width: 100px; text-align: right;' },
    { key: '联系电话', value: '138-0000-0000', keyStyle: 'width: 100px; text-align: right;' },
    { key: '地址', value: '北京市朝阳区', keyStyle: 'width: 100px; text-align: right;' },
  ];
</script>

<Descriptions {data} align="center" />
