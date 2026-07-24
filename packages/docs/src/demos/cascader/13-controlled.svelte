<script lang="ts">
  import { Cascader, Button, Space } from '@chenzy-design/svelte';
  import { treeData } from './_data';

  type Key = string | number;
  let value = $state<Key[]>(['zhejiang', 'hangzhou', 'xihu']);
</script>

<Space vertical align="start">
  <Space>
    <Button onclick={() => (value = ['zhejiang', 'ningbo', 'jiangbei'])}>设为「浙江省 / 宁波市 / 江北区」</Button>
    <Button onclick={() => (value = [])}>清空</Button>
  </Space>
  <Cascader
    style="width: 300px"
    {treeData}
    {value}
    placeholder="受控的 Cascader"
    onChange={(p) => (value = p as Key[])}
  />
</Space>
