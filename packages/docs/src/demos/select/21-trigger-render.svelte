<script lang="ts">
  import { Select, Tag, TagInput } from '@chenzy-design/svelte';
  import { IconAppCenter, IconChevronDown } from '@chenzy-design/icons';

  let valList = $state<string[]>(['douyin', 'ulikecam']);

  const list = [
    { value: 'douyin', label: '抖音' },
    { value: 'ulikecam', label: '轻颜相机' },
    { value: 'jianying', label: '剪映' },
    { value: 'toutiao', label: '今日头条' },
  ];

  // 拖拽排序触发器：复用 TagInput draggable 能力
  let valList2 = $state<string[]>(['douyin', 'ulikecam']);
  let inputVal = $state('');

  function handleSort(currentLabels: string[]) {
    const newValue = currentLabels.map((label) => list.find((i) => i.label === label)!.value);
    valList2 = newValue;
  }
</script>

<div>
  <h4>不同背景色的触发器</h4>
  <Select
    value={valList}
    optionList={list}
    onChange={(v) => (valList = v as string[])}
    multiple
    filter
    searchPosition="dropdown"
    style="width: 240px"
  >
    {#snippet triggerRender({ selectedOptions })}
      <div
        style="min-width: 112px; background-color: var(--cd-color-primary-light-default); height: 32px; display: flex; align-items: center; padding-left: 12px; border-radius: 3px; color: var(--cd-color-primary)"
      >
        <div style="font-weight: 600; flex-shrink: 0; font-size: 14px">业务线</div>
        <div style="margin: 4px; white-space: nowrap; text-overflow: ellipsis; flex-grow: 1; overflow: hidden">
          {selectedOptions.map((item) => item.label).join(' , ')}
        </div>
        <IconAppCenter style="margin-right: 8px; flex-shrink: 0" />
      </div>
    {/snippet}
  </Select>
  <br />
  <br />
  <h4>使用 circle Tag 作为触发器</h4>
  <Select
    value={valList}
    onChange={(v) => (valList = v as string[])}
    optionList={list}
    filter
    multiple
    searchPosition="dropdown"
    style="width: 240px; margin-top: 20px"
  >
    {#snippet triggerRender({ selectedOptions })}
      <div
        style="margin: 4px; white-space: nowrap; text-overflow: ellipsis; flex-grow: 1; overflow: hidden; display: flex; align-items: center"
      >
        <Tag size="large" color="cyan" shape="circle">
          {selectedOptions.map((item) => item.label).join(' / ')}
          {#snippet suffixIcon()}
            <IconChevronDown />
          {/snippet}
        </Tag>
      </div>
    {/snippet}
  </Select>
  <br />
  <br />
  <h4>可对已选项拖拽重新排序的 Select</h4>
  <Select
    value={valList2}
    optionList={list}
    onChange={(v) => (valList2 = v as string[])}
    multiple
    filter
    style="width: 240px"
  >
    {#snippet triggerRender({ selectedOptions, onSearch })}
      <div role="presentation" onkeydown={(e) => e.stopPropagation()}>
        <TagInput
          draggable
          allowDuplicates={false}
          value={selectedOptions.map((item) => item.label)}
          inputValue={inputVal}
          onInputChange={(word) => {
            onSearch(word);
            inputVal = word;
          }}
          onChange={handleSort}
          showClear
        />
      </div>
    {/snippet}
  </Select>
</div>
