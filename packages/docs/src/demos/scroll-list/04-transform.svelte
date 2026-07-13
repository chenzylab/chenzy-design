<script lang="ts">
  // 选中项文案变换（transform，补全 Semi 有 API 但 demo 未展示的场景）：
  // 选中项经 transform 加单位后显示；未选中项显示原值。列级公共 transform 与项级 transform 并存，
  // 项级优先（下例「12」项单独展示「正午」）。
  import { ScrollList, ScrollItem, Text } from '@chenzy-design/svelte';
  import type { ScrollItemData, ScrollItemSelectPayload } from '@chenzy-design/svelte';

  const hours: ScrollItemData[] = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    text: String(i).padStart(2, '0'),
    // 项级 transform：中午 12 点选中时特殊展示。
    ...(i === 12 ? { transform: () => '正午' } : {}),
  }));

  let idx = $state(9);
  function onSelect(data: ScrollItemSelectPayload): void {
    idx = data.index;
  }
</script>

<div style="width: 120px">
  <ScrollList header="小时（选中加「时」）">
    <ScrollItem
      mode="wheel"
      cycled
      list={hours}
      selectedIndex={idx}
      transform={(v) => `${v} 时`}
      {onSelect}
      ariaLabel="小时"
    />
  </ScrollList>
</div>

<div style="margin-top:8px"><Text type="tertiary">选中：{hours[idx]?.value} 时</Text></div>
