<script lang="ts">
  // 栅格列表：grid 的 span 设置每项占格数（24 栅格），gutter 控制间距。
  import { List, Descriptions, ButtonGroup, Rating, Button } from '@chenzy-design/svelte';

  const data = [
    { title: 'Semi UI', rating: 4.5, feedbacks: 124 },
    { title: 'Semi DSM', rating: 4, feedbacks: 108 },
    { title: 'Semi D2C', rating: 4.5, feedbacks: 244 },
  ];

  const style =
    'border:1px solid var(--cd-color-border); background-color:var(--cd-color-bg-2); border-radius:3px; padding-left:20px;';
</script>

<List dataSource={data} grid={{ gutter: 12, span: 6 }}>
  {#snippet renderItem(item)}
    {#snippet ratingValue()}
      <Rating allowHalf size="small" value={item.rating} />
    {/snippet}
    <List.Item {style}>
      <div>
        <h3 style="color:var(--cd-color-text-0); font-weight:500;">{item.title}</h3>
        <Descriptions
          align="center"
          size="small"
          row
          data={[
            { key: '满意度', value: ratingValue },
            { key: '反馈数', value: String(item.feedbacks) },
          ]}
        />
        <div style="margin:12px 0; display:flex; justify-content:flex-end;">
          <ButtonGroup theme="borderless" style="margin-top:8px;">
            <Button>编辑</Button>
            <Button>更多</Button>
          </ButtonGroup>
        </div>
      </div>
    </List.Item>
  {/snippet}
</List>
