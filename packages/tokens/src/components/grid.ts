/**
 * Component tokens for Grid (Row/Col). 全量对齐 Semi Design
 * （semi-foundation/grid/variables.scss，19 个），升级为带元数据的 TokenDef
 * 结构以支持 DSM。断点 min/max 为派生量（editable:false）。
 *
 * Grid 组件（Row/Col）走 float + 内联样式机制，无运行时 CSS 变量消费；
 * 这里的 token 仅作为设计变量表（断点尺寸 + 栅格列数/槽宽）展示，逐字对齐 Semi。
 *
 * 注：
 * - sm/md/lg/xl/xxl 断点复用我们的 --cd-breakpoint-*（值与 Semi 一致）；
 *   Semi 的 xs=480px 我们无对应 alias（xs 为 0-width 基档），保留字面量。
 * - Semi 的 -min = 对应 screen 值；-max = (下一档 min - 1px)，用 calc 表达。
 *
 * 见 specs/components/basic/Grid.spec.md、specs/00-foundation/dsm.spec.md §4。
 */
import type { TokenGroup } from './token-def.js';

export const gridTokens = {
  // —— 断点尺寸（min-width） ——
  'width-grid-screen-xs': { value: '480px', category: 'width', label: '超小屏断点', usage: '超小尺寸设备 - 手机' },
  'width-grid-screen-xs-min': { value: '480px', category: 'width', label: '超小屏下界', usage: '超小尺寸设备下界（= xs）', editable: false },
  'width-grid-screen-sm': { value: 'var(--cd-breakpoint-sm)', category: 'width', label: '小屏断点', usage: '小尺寸设备 - 平板' },
  'width-grid-screen-sm-min': { value: 'var(--cd-breakpoint-sm)', category: 'width', label: '小屏下界', usage: '小尺寸设备下界（= sm）', editable: false },
  'width-grid-screen-md': { value: 'var(--cd-breakpoint-md)', category: 'width', label: '中屏断点', usage: '中尺寸设备 - 水平平板' },
  'width-grid-screen-md-min': { value: 'var(--cd-breakpoint-md)', category: 'width', label: '中屏下界', usage: '中尺寸设备下界（= md）', editable: false },
  'width-grid-screen-lg': { value: 'var(--cd-breakpoint-lg)', category: 'width', label: '大屏断点', usage: '大尺寸设备 - 小尺寸桌面端' },
  'width-grid-screen-lg-min': { value: 'var(--cd-breakpoint-lg)', category: 'width', label: '大屏下界', usage: '大尺寸设备下界（= lg）', editable: false },
  'width-grid-screen-xl': { value: 'var(--cd-breakpoint-xl)', category: 'width', label: '超大屏断点', usage: '超大尺寸设备 - 桌面端' },
  'width-grid-screen-xl-min': { value: 'var(--cd-breakpoint-xl)', category: 'width', label: '超大屏下界', usage: '超大尺寸设备下界（= xl）', editable: false },
  'width-grid-screen-xxl': { value: 'var(--cd-breakpoint-xxl)', category: 'width', label: '巨屏断点', usage: '超大尺寸设备 - 桌面端 HD' },
  'width-grid-screen-xxl-min': { value: 'var(--cd-breakpoint-xxl)', category: 'width', label: '巨屏下界', usage: '巨屏设备下界（= xxl）', editable: false },

  // —— 断点上界（= 下一档 min - 1px，派生量） ——
  'width-grid-screen-xs-max': { value: 'calc(var(--cd-breakpoint-sm) - 1px)', category: 'width', label: '超小屏上界', usage: 'xs 上界（= sm-min - 1px）', editable: false },
  'width-grid-screen-sm-max': { value: 'calc(var(--cd-breakpoint-md) - 1px)', category: 'width', label: '小屏上界', usage: 'sm 上界（= md-min - 1px）', editable: false },
  'width-grid-screen-md-max': { value: 'calc(var(--cd-breakpoint-lg) - 1px)', category: 'width', label: '中屏上界', usage: 'md 上界（= lg-min - 1px）', editable: false },
  'width-grid-screen-lg-max': { value: 'calc(var(--cd-breakpoint-xl) - 1px)', category: 'width', label: '大屏上界', usage: 'lg 上界（= xl-min - 1px）', editable: false },
  'width-grid-screen-xl-max': { value: 'calc(var(--cd-breakpoint-xxl) - 1px)', category: 'width', label: '超大屏上界', usage: 'xl 上界（= xxl-min - 1px）', editable: false },

  // —— 栅格系统 ——
  'width-grid-columns': { value: '24', category: 'other', label: '栅格列数', usage: '栅格宽度' },
  'width-grid-gutter': { value: '0', category: 'spacing', label: '槽宽度', usage: '槽宽度' },
} satisfies TokenGroup;
