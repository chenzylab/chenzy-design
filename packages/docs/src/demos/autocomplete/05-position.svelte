<script lang="ts">
  import { AutoComplete } from '@chenzy-design/svelte';

  let data = $state<string[]>([]);

  const change = (input: string) => {
    data = input ? ['gmail.com', '163.com', 'qq.com'].map((domain) => `${input}@${domain}`) : [];
  };
</script>

<div>
  <AutoComplete
    {data}
    position="topLeft"
    onSearch={change}
    placeholder="选项菜单在上方显示"
    style="width: 200px; margin: 10px"
  />
  <AutoComplete
    {data}
    position="bottomRight"
    onSearch={change}
    placeholder="选项菜单靠右显示"
    style="width: 200px; margin: 10px"
  />
</div>
