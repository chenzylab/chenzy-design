<script lang="ts">
  import { Transfer, Checkbox, Avatar } from '@chenzy-design/svelte';
  import { IconHandle, IconClose } from '@chenzy-design/icons';
  import type { TransferItem } from '@chenzy-design/svelte';

  // 严格对齐 Semi 官方「拖拽 + 自定义已选项渲染」demo：Avatar + Checkbox 渲染候选项，
  // sortableHandle 包裹 IconHandle 作为拖拽触发区域，自定义 filter 同时匹配姓名/邮箱。
  const data = [
    { label: '夏可漫', value: 'xiakeman@example.com', abbr: '夏', color: 'amber', area: 'US', key: 1 },
    { label: '申悦', value: 'shenyue@example.com', abbr: '申', color: 'indigo', area: 'UK', key: 2 },
    { label: '文嘉茂', value: 'wenjiamao@example.com', abbr: '文', color: 'cyan', area: 'HK', key: 3 },
    { label: '曲晨一', value: 'quchenyi@example.com', abbr: '曲', color: 'blue', area: 'India', key: 4 },
    { label: '曲晨二', value: 'quchener@example.com', abbr: '二', color: 'blue', area: 'India', key: 5 },
    { label: '曲晨三', value: 'quchensan@example.com', abbr: '三', color: 'blue', area: 'India', key: 6 },
  ];

  let value = $state<(string | number)[]>(['xiakeman@example.com', 'shenyue@example.com']);

  function customFilter(input: string, item: TransferItem) {
    return String(item.value ?? '').includes(input) || item.label.includes(input);
  }
</script>

<Transfer
  draggable
  style="width: 568px"
  dataSource={data}
  filter={customFilter}
  {value}
  inputProps={{ placeholder: '搜索姓名或邮箱' }}
  onChange={(values) => (value = values)}
>
  {#snippet renderSourceItem({ item, onChange, checked })}
    <div class="components-transfer-demo-source-item">
      <Checkbox {checked} onChange={() => onChange()} style="height: 52px; align-items: center">
        <Avatar color={item.color as 'amber'} size="small">{item.abbr}</Avatar>
        <div class="info">
          <div class="name">{item.label}</div>
          <div class="email">{item.value}</div>
        </div>
      </Checkbox>
    </div>
  {/snippet}
  {#snippet renderSelectedItem({ item, onRemove, sortableHandle })}
    <div class="components-transfer-demo-selected-item">
      <span class="cd-right-item-drag-handler" {@attach sortableHandle()}><IconHandle /></span>
      <Avatar color={item.color as 'amber'} size="small">{item.abbr}</Avatar>
      <div class="info">
        <div class="name">{item.label}</div>
        <div class="email">{item.value}</div>
      </div>
      <IconClose onclick={onRemove} />
    </div>
  {/snippet}
</Transfer>

<style>
  .components-transfer-demo-source-item,
  .components-transfer-demo-selected-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    width: 100%;
  }
  .components-transfer-demo-selected-item {
    cursor: default;
  }
  .cd-right-item-drag-handler {
    cursor: pointer;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 14px;
    color: var(--cd-color-text-0);
  }
  .email {
    font-size: 12px;
    color: var(--cd-color-text-2);
  }
</style>
