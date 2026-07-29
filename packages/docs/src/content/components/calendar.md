---
title: Calendar 日历
name: calendar
category: show
brief: 日历组件，允许以日/周/月视图展示对应事件
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Day from '../../demos/calendar/01-day.svelte';
  import daySrc from '../../demos/calendar/01-day.svelte?raw';
  import Week from '../../demos/calendar/02-week.svelte';
  import weekSrc from '../../demos/calendar/02-week.svelte?raw';
  import Month from '../../demos/calendar/03-month.svelte';
  import monthSrc from '../../demos/calendar/03-month.svelte?raw';
  import WeekStartsOn from '../../demos/calendar/04-week-starts-on.svelte';
  import weekStartsOnSrc from '../../demos/calendar/04-week-starts-on.svelte?raw';
  import MultiDay from '../../demos/calendar/05-multi-day.svelte';
  import multiDaySrc from '../../demos/calendar/05-multi-day.svelte?raw';
  import Events from '../../demos/calendar/06-events.svelte';
  import eventsSrc from '../../demos/calendar/06-events.svelte?raw';
  import DateGridEvent from '../../demos/calendar/07-date-grid-event.svelte';
  import dateGridEventSrc from '../../demos/calendar/07-date-grid-event.svelte?raw';
  import DateGridCell from '../../demos/calendar/08-date-grid-cell.svelte';
  import dateGridCellSrc from '../../demos/calendar/08-date-grid-cell.svelte?raw';
  import RenderDateDisplay from '../../demos/calendar/09-render-date-display.svelte';
  import renderDateDisplaySrc from '../../demos/calendar/09-render-date-display.svelte?raw';

  const snippetLiteral = String.fromCharCode(123) + '#snippet' + String.fromCharCode(125);
</script>

## 代码演示

### 如何引入

```jsx
import { Calendar } from '@chenzy-design/svelte';
```

### 日视图

日视图的日历模板，可通过 `showCurrTime` 控制是否显示当前时间的位置红线。

<DemoBox code={daySrc}><Day /></DemoBox>

### 周视图

周视图的日历模板，可通过 `showCurrTime` 控制是否显示当前时间的位置红线。

<DemoBox code={weekSrc}><Week /></DemoBox>

### 月视图

月视图的日历模板。

<DemoBox code={monthSrc}><Month /></DemoBox>

### 设置周起始日

可以通过 weekStartsOn 设置周几作为每周第一天，0 代表周日，1 代表周一，以此类推。默认为周日。weekStartsOn 对月视图、周视图生效。

<DemoBox code={weekStartsOnSrc}><WeekStartsOn /></DemoBox>

### 多日视图

多日视图模式。 `range` 必传，左闭右开。

<DemoBox code={multiDaySrc}><MultiDay /></DemoBox>

### 事件渲染用法

通过 `events` 传入需要渲染的事件，`events` 是一个由 event objects 组成的数组，具体形式请参考 events API。

<DemoBox code={eventsSrc}><Events /></DemoBox>

### 自定义渲染

通过 dateGridRender 可以自定义渲染日期单元格/列。需要使用绝对定位。

#### 自定义渲染事件

<DemoBox code={dateGridEventSrc}><DateGridEvent /></DemoBox>

#### 自定义渲染单元格样式

可以通过 dateGridRender 自定义单元格的背景，月视图的文字 zIndex 默认为 3，如需完全覆盖单元格可以设置更大的 zIndex 来实现。

<DemoBox code={dateGridCellSrc}><DateGridCell /></DemoBox>

#### 自定义日期文案

可以通过 renderDateDisplay 自定义日期文案。

<DemoBox code={renderDateDisplaySrc}><RenderDateDisplay /></DemoBox>

## API 参考

### Calendar

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allDayEventsRender | 自定义日/多日/周视图下的顶部事件渲染，入参为全量 events | `(events: CalendarEvent[]) => Snippet` | - |
| class | 根节点自定义类名 | string | - |
| dateGridRender | 自定义单元格/列渲染，需要绝对定位 | `(dateString: string, date: Date) => Snippet` | - |
| displayValue | 展示日期 | Date | 当前日期 |
| events | 渲染事件，具体格式请参考 event object | `CalendarEvent[]` | - |
| header | 自定义头部内容 | Snippet | - |
| height | 日历高度 | string \| number | 600 |
| markWeekend | 区分周末列和工作日，以灰色显示 | boolean | false |
| minEventHeight | 日视图、多日视图以及周视图下事件的最小高度 | number | Number.MIN_SAFE_INTEGER |
| mode | 初始模式，`day`, `week`, `month`, `range` | "day" \| "week" \| "month" \| "range" | `week` |
| onClick | 单击日期格的回调，日视图和周视图以半小时为单位，月视图以日为单位 | `(e: Event, date: Date) => void` | - |
| onClose | 月视图下，展示所有 event 的卡片关闭时的回调 | `(e: Event) => void` | - |
| onMoreClick | 月视图下，点击「还有几项」时的回调 | `(e: Event, date: Date, remaining: number) => void` | - |
| range | 多日视图模式下展示的日期范围，左闭右开 | `[Date, Date]` | - |
| renderDateDisplay | 自定义日期文案 | `Snippet<[date: Date]>` | - |
| renderTimeDisplay | 自定义日/周视图下的时间文案 | `(time: number) => string` | - |
| scrollTop | 日视图和周视图模式下，设置展示内容默认的滚动高度 | number | 400 |
| showCurrTime | 显示当前时间 | boolean | true |
| style | 根节点内联样式，合并在 height / width 之后，可覆盖二者 | string | - |
| weekStartsOn | 以周几作为每周第一天，0 代表周日，1 代表周一，以此类推 | number | 0 |
| width | 日历宽度 | string \| number | - |

<Notice type="primary" title="与 Semi 的技术差异">

Semi 的 <code>dateGridRender</code> / <code>allDayEventsRender</code> 返回 ReactNode，本库返回 Snippet（用 <code>{snippetLiteral}</code> 定义后由这两个函数返回）；<code>renderDateDisplay</code> 在本库直接是接收 <code>date</code> 的 Snippet。<code>renderTimeDisplay</code> 返回字符串。事件外观由 event 的 <code>children</code> 承载：字符串直接渲染，复杂内容传 Snippet。

</Notice>

### Event Object

`events` 是一个 event object 组成的数组，event object 约定格式如下：
当事件为全天事件时，若没有传入起始结束时间，则自动追加到 `displayValue` 的日期中；当事件不是全天事件时，起始结束时间至少传入一个才会被视为有效事件

<Notice type="primary" title="注意">

不同 event 的 key 值要求必填且唯一，以此控制事件的更新与重绘。

</Notice>

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| allDay | 全天事件 | boolean | false |
| children | 展示内容 | string \| Snippet | - |
| end | 事情结束的时间 | Date | - |
| key | required 且要求唯一 | string | - |
| start | 事情起始的时间 | Date | - |

## 无障碍

- 日历容器使用 `role="grid"`，星期 / 日期表头使用 `role="columnheader"`，日期格子（日 / 周 / 多日视图的列、月视图的日格）使用 `role="gridcell"`。
- 日 / 周 / 多日视图的半小时时间格可点击并带日期时间 `aria-label`；月视图 today 格设 `aria-current="date"`。
- 事件标记不以颜色为唯一区分，需同时配合文案或图标传达语义。

## 文案规范

- 当需要显示时间时，12 小时制和 24 小时制都是可以使用的
- 如果采用 12 小时制，需要搭配 AM/PM 一起使用
- 关于月份、星期、时间的缩写使用规则，可参考缩写规范
