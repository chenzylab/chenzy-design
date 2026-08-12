<script lang="ts">
  import { Transfer, Checkbox, Avatar, Highlight } from '@chenzy-design/svelte';
  import { IconClose } from '@chenzy-design/icons';
  import type { TransferItem } from '@chenzy-design/svelte';

  let searchText = $state('');

  const customFilter = (sugInput: string, item: TransferItem) =>
    String(item.value ?? '').includes(sugInput) || item.label.includes(sugInput);

  const data = [
    { label: '夏可漫', value: 'xiakeman@example.com', abbr: '夏', color: 'amber', area: 'US', key: 1 },
    { label: '申悦', value: 'shenyue@example.com', abbr: '申', color: 'indigo', area: 'UK', key: 2 },
    { label: '文嘉茂', value: 'wenjiamao@example.com', abbr: '文', color: 'cyan', area: 'HK', key: 3 },
    { label: '曲晨一', value: 'quchenyi@example.com', abbr: '曲', color: 'blue', area: 'India', key: 4 },
    { label: '曲晨二', value: 'quchener@example.com', abbr: '二', color: 'blue', area: 'India', key: 5 },
    { label: '曲晨三', value: 'quchensan@example.com', abbr: '三', color: 'blue', area: 'India', key: 6 },
  ];

  let value = $state<(string | number)[]>(['xiakeman@example.com', 'shenyue@example.com']);
</script>

<Transfer
  style="width: 568px"
  dataSource={data}
  filter={customFilter}
  {value}
  inputProps={{ placeholder: '搜索姓名或邮箱' }}
  onSearch={(text) => (searchText = text)}
  onChange={(values) => (value = values)}
>
  {#snippet renderSourceItem({ item, onChange, checked })}
    <div class="components-transfer-demo-source-item">
      <Checkbox {checked} onChange={() => onChange()} style="height: 52px; align-items: center">
        <Avatar color={item.color as 'amber'} size="small">{item.abbr}</Avatar>
        <div class="info">
          <div class="name"><Highlight sourceString={item.label} searchWords={[searchText]} /></div>
          <div class="email"><Highlight sourceString={String(item.value)} searchWords={[searchText]} /></div>
        </div>
      </Checkbox>
    </div>
  {/snippet}
  {#snippet renderSelectedItem({ item, onRemove })}
    <div class="components-transfer-demo-selected-item">
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
  .components-transfer-demo-selected-item :global(.cd-icon-close) {
    visibility: hidden;
    color: var(--cd-color-text-3);
  }
  .components-transfer-demo-selected-item:hover :global(.cd-icon-close) {
    visibility: visible;
  }
  .components-transfer-demo-selected-item,
  .components-transfer-demo-source-item {
    height: 52px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
  }
  .components-transfer-demo-selected-item:hover,
  .components-transfer-demo-source-item:hover {
    background-color: var(--cd-color-fill-0);
  }
  .info {
    margin-left: 8px;
    flex-grow: 1;
  }
  .name {
    font-size: 14px;
    line-height: 20px;
  }
  .email {
    font-size: 12px;
    line-height: 16px;
    color: var(--cd-color-text-2);
  }
</style>
