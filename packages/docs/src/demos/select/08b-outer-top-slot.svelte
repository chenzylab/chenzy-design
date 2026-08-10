<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  const list: Record<string, { value: string; label: string }[]> = {
    component: [
      { value: 'select', label: '选择器' },
      { value: 'tabs', label: '标签' },
      { value: 'avatar', label: '头像' },
      { value: 'button', label: '按钮' },
    ],
    design: [
      { value: 'color', label: '颜色' },
      { value: 'dark', label: '暗色模式' },
      { value: 'icon', label: '图标' },
      { value: 'font', label: '字体' },
    ],
    feedback: [
      { value: 'faq', label: '常见问题' },
      { value: 'join', label: '加入用户群' },
      { value: 'hornbill', label: '犀鸟反馈问题' },
    ],
  };

  const tabOptions = [
    { itemKey: 'component', label: '组件' },
    { itemKey: 'design', label: '设计' },
    { itemKey: 'feedback', label: '反馈' },
  ];

  let key = $state('component');
  let value = $state('faq');

  const tabWrapperStyle =
    'display: flex; padding-top: 8px; padding-left: 32px; border-bottom: 0.5px solid var(--cd-color-border);';
  const tabStyle = 'cursor: pointer; margin-right: 12px; padding-bottom: 4px;';
  const tabActiveStyle = `${tabStyle} border-bottom: 1px solid var(--cd-color-primary); font-weight: 700;`;
</script>

<Select
  defaultOpen
  autoAdjustOverflow={false}
  style="width: 200px"
  optionList={list[key]}
  bind:value
>
  {#snippet outerTopSlot()}
    <div style={tabWrapperStyle} role="tablist">
      {#each tabOptions as tab (tab.itemKey)}
        <div
          style={tab.itemKey === key ? tabActiveStyle : tabStyle}
          role="tab"
          tabindex="0"
          aria-selected={tab.itemKey === key}
          onclick={() => (key = tab.itemKey)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              key = tab.itemKey;
            }
          }}
        >
          {tab.label}
        </div>
      {/each}
    </div>
  {/snippet}
</Select>
