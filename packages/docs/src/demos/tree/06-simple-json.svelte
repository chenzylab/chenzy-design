<script lang="ts">
  import { Tree } from '@chenzy-design/svelte';

  // treeDataSimpleJson：扁平 { key: value } 键值对，key 同时作 key/label，嵌套对象转子树
  const json = {
    亚洲: {
      中国: { 北京: 'beijing', 上海: 'shanghai' },
      日本: 'japan',
    },
    北美洲: {
      美国: 'us',
      加拿大: 'canada',
    },
  };
</script>

<div style="width:260px">
  <Tree style="width: 260px; height: 420px; border: 1px solid var(--cd-color-border); border-radius: 6px; box-sizing: border-box" treeDataSimpleJson={json} defaultExpandAll ariaLabel="简单 JSON 树" />
</div>
