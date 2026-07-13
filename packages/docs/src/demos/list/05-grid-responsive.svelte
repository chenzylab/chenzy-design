<script lang="ts">
  // 响应式栅格列表：grid 的 xs/sm/md/lg/xl/xxl 按断点设置每项占格数（响应尺寸与 Grid 一致）。
  import { List, Rating, Button } from '@chenzy-design/svelte';

  const data = [
    { title: '审核管理平台', rating: 4.5, feedbacks: 124 },
    { title: '扁鹊', rating: 4, feedbacks: 108 },
    { title: '直播审核平台', rating: 3.5, feedbacks: 244 },
    { title: '抖音安全测试', rating: 0, feedbacks: 189 },
    { title: '内容平台', rating: 3, feedbacks: 128 },
    { title: '策略平台', rating: 4, feedbacks: 156 },
  ];

  const cardStyle =
    'border:1px solid var(--cd-color-border); background:var(--cd-color-bg-2); border-radius:3px; padding:16px 20px; margin:8px 2px; width:100%; box-sizing:border-box;';
</script>

<List
  dataSource={data}
  grid={{ gutter: 12, xs: 24, sm: 24, md: 12, lg: 8, xl: 8, xxl: 6 }}
>
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
