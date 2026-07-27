<script lang="ts">
  import { DatePicker, Tabs, Text, Space } from '@chenzy-design/svelte';
  import { IconBulb } from '@chenzy-design/icons';

  let activeTab = $state('1');
  let date = $state<Date | Date[] | null>(null);

  const uedDisabledDate = (currentDate: Date) =>
    !!currentDate && currentDate.getDate() > 10 && currentDate.getDate() < 15;
  const testDisabledDate = (currentDate: Date) =>
    !!currentDate && currentDate.getDate() > 15 && currentDate.getDate() < 25;

  const disabledDate = $derived(
    activeTab === '1' ? uedDisabledDate : testDisabledDate,
  );

  function handleTabChange(tab: string) {
    activeTab = tab;
    date = null;
  }

  function handleDateChange(value: unknown) {
    date = value as Date | Date[] | null;
  }
</script>

{#snippet topSlot()}
  <Tabs
    size="small"
    activeKey={activeTab}
    onChange={(k) => handleTabChange(String(k))}
    tabList={[
      { tab: 'UED 排期', itemKey: '1' },
      { tab: '测试排期', itemKey: '2' },
    ]}
    style="padding: 12px 20px 0"
  />
{/snippet}

{#snippet bottomSlot()}
  <Space style="padding: 12px 20px">
    <IconBulb style="color: var(--cd-color-amber-5)" />
    <Text strong style="color: var(--cd-color-text-2)">定版前请阅读</Text>
    <Text link={{ href: 'https://semi.design/', target: '_blank' }}
      >发版须知</Text
    >
  </Space>
{/snippet}

{#snippet monthBottomSlot()}
  <Space style="padding: 12px 20px">
    <IconBulb style="color: var(--cd-color-amber-5)" />
    <Text strong style="color: var(--cd-color-text-2)">请阅读</Text>
    <Text link={{ href: 'https://semi.design/', target: '_blank' }}>须知</Text>
  </Space>
{/snippet}

<div>
  <DatePicker
    {topSlot}
    {disabledDate}
    value={date}
    onChange={handleDateChange}
    placeholder="请选择排期"
  />
  <br />
  <br />
  <DatePicker {bottomSlot} placeholder="请选择发版时间" />
  <br />
  <br />
  <DatePicker
    type="month"
    bottomSlot={monthBottomSlot}
    placeholder="请选择年月"
  />
  <br />
  <br />
  <DatePicker {topSlot} {bottomSlot} density="compact" placeholder="小尺寸" />
  <br />
  <br />
  <DatePicker type="dateTimeRange" {bottomSlot} style="width: 400px" />
  <br />
  <br />
</div>
