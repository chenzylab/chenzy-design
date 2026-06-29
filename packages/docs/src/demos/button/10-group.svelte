<script lang="ts">
  import { Button, ButtonGroup } from '@chenzy-design/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
  <!-- 组级默认 type/theme 经 context 透传，无需逐个设置 -->
  <ButtonGroup type="primary" theme="solid" ariaLabel="文本对齐">
    <Button>左对齐</Button>
    <Button>居中</Button>
    <Button>右对齐</Button>
  </ButtonGroup>

  <!-- 组内 Button 仍可单独覆盖（如此处 danger 覆盖组级 secondary） -->
  <ButtonGroup theme="outline" ariaLabel="操作">
    <Button>编辑</Button>
    <Button>复制</Button>
    <Button type="danger">删除</Button>
  </ButtonGroup>

  <ButtonGroup type="tertiary" theme="light" size="small" ariaLabel="分页">
    <Button>上一页</Button>
    <Button>下一页</Button>
  </ButtonGroup>
</div>
