<script lang="ts">
  // 栅格列表：grid 的 span 设置每项占格数（24 栅格），gutter 控制间距。
  import { List, Rating, Button } from '@chenzy-design/svelte';

  const data = [
    { title: 'Semi UI', rating: 4.5, feedbacks: 124 },
    { title: 'Semi DSM', rating: 4, feedbacks: 108 },
    { title: 'Semi D2C', rating: 4.5, feedbacks: 244 },
    { title: 'Semi Pro', rating: 5, feedbacks: 66 },
  ];

  const cardStyle =
    'border:1px solid var(--cd-color-border); background:var(--cd-color-bg-2); border-radius:3px; padding:16px 20px; width:100%; box-sizing:border-box;';
</script>

<List dataSource={data} grid={{ gutter: 12, span: 6 }}>
  {#snippet renderItem(item)}
    <List.Item style={cardStyle}>
      <div>
        <h3 style="color:var(--cd-color-text-0); font-weight:500; margin:0 0 8px;">{item.title}</h3>
        <div style="display:flex; align-items:center; gap:8px; color:var(--cd-color-text-2);">
          <span>满意度</span><Rating allowHalf size="small" value={item.rating} />
        </div>
        <div style="color:var(--cd-color-text-2); margin-top:4px;">反馈数 {item.feedbacks}</div>
        <div style="margin:12px 0 0; display:flex; justify-content:flex-end; gap:8px;">
          <Button theme="borderless">编辑</Button>
          <Button theme="borderless">更多</Button>
        </div>
      </div>
    </List.Item>
  {/snippet}
</List>
