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

<!-- compact 那个 DatePicker 的 slot 内边距更紧（对齐 Semi demo 传的
     style={{ padding: '8px 12px 0' }} / '8px 12px'）。 -->
{#snippet topSlotCompact()}
  <Tabs
    size="small"
    activeKey={activeTab}
    onChange={(k) => handleTabChange(String(k))}
    tabList={[
      { tab: 'UED 排期', itemKey: '1' },
      { tab: '测试排期', itemKey: '2' },
    ]}
    style="padding: 8px 12px 0"
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

{#snippet bottomSlotCompact()}
  <Space style="padding: 8px 12px">
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
    dropdownClassName="components-datepicker-demo-slot"
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
  <DatePicker
    topSlot={topSlotCompact}
    bottomSlot={bottomSlotCompact}
    density="compact"
    dropdownClassName="components-datepicker-demo-slot"
    placeholder="小尺寸"
  />
  <br />
  <br />
  <DatePicker type="dateTimeRange" {bottomSlot} style="width: 400px" />
  <br />
  <br />
</div>

<style>
  /* 照搬 Semi demo 的 .components-datepicker-demo-slot（demo 级覆盖，非组件缺陷）：
     Tabs 只用来做顶部切换、不渲染内容区，故内容区 padding 归零；
     并去掉 tab bar 的底边框，避免与面板 topSlot 自身的分隔线叠成双线。
     面板 portal 到 body，故必须 :global 打洞。 */
  /* 本库 Tabs 走 BEM 类名（cd-tabs__content / .cd-tabs--line .cd-tabs__bar），
     与 Semi 的 semi-tabs-content / semi-tabs-bar-line 命名不同，按本库实际类名写。 */
  :global(.components-datepicker-demo-slot .cd-tabs__content) {
    padding: 0;
  }
  :global(.components-datepicker-demo-slot .cd-tabs--line .cd-tabs__bar) {
    border-block-end: none;
  }
</style>
