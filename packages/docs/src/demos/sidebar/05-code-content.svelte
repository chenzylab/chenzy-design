<script lang="ts">
  // 对齐 Semi「代码展示」段：用 SideBarCodeItem 展示单条代码/JSON 内容
  // （不含折叠头，仅内容区），配合 RadioGroup 切换 JSON / CSS 两种内容。
  import { SideBarCodeItem, RadioGroup, Radio } from '@chenzy-design/svelte';
  import type { CodeItemProps } from '@chenzy-design/svelte';

  const jsonProps: CodeItemProps = {
    key: 'json',
    isJson: true,
    content: JSON.stringify(
      { name: 'search_web', arguments: { query: 'chenzy-design', top_k: 5 } },
      null,
      2,
    ),
  };

  const cssProps: CodeItemProps = {
    key: 'css',
    language: 'css',
    content: `.sidebar-demo {
  display: flex;
  align-items: center;
  border-radius: 8px;
}`,
  };

  let type = $state<'json' | 'css'>('json');
</script>

<RadioGroup
  type="button"
  buttonSize="middle"
  value={type}
  onChange={(e) => (type = e.target.value as 'json' | 'css')}
>
  <Radio value="json">JSON</Radio>
  <Radio value="css">CSS</Radio>
</RadioGroup>

<div style="height: 200px; overflow: auto; margin-top: 10px;">
  <SideBarCodeItem code={type === 'json' ? jsonProps : cssProps} />
</div>
