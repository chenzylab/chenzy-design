// Table demo 共享数据与常量，严格对齐 Semi Design 官方 Table 文档蓝本
// （Semi Design 设计稿.fig / 姜鹏志 / figma-icon 等），供各 demo 复用避免重复。

export const figmaIconUrl =
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/figma-icon.png';
export const docsIconUrl =
  'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png';

export const DAY = 24 * 60 * 60 * 1000;

export type FileRow = {
  key: string;
  name: string;
  nameIconSrc?: string;
  size: number | string;
  owner: string;
  status?: string;
  updateTime: number | string;
  avatarBg: string;
  [k: string]: unknown;
};

// 46 条循环生成数据（对齐 Semi getData：Semi Design / Semi D2C 交替）。
export function getData(total = 46): FileRow[] {
  const data: FileRow[] = [];
  for (let i = 0; i < total; i++) {
    const isSemiDesign = i % 2 === 0;
    const randomNumber = (i * 1000) % 199;
    data.push({
      key: '' + i,
      name: isSemiDesign ? `Semi Design 设计稿${i}.fig` : `Semi D2C 设计稿${i}.fig`,
      owner: isSemiDesign ? '姜鹏志' : '郝宣',
      size: randomNumber,
      status: isSemiDesign ? 'success' : 'wait',
      updateTime: Date.now() + randomNumber * DAY,
      avatarBg: isSemiDesign ? 'grey' : 'red',
    });
  }
  return data;
}

// 格式化时间戳为 yyyy-MM-dd（对齐 Semi demo 里的 date-fns format）。
export function formatDate(value: unknown): string {
  const d = new Date(value as number | string);
  if (Number.isNaN(d.getTime())) return String(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 交付状态 Tag 配置（对齐 Semi tagConfig）。
export const statusTagConfig: Record<
  string,
  { color: string; icon: 'tick' | 'clear' | 'comment'; text: string }
> = {
  success: { color: 'green', icon: 'tick', text: '已交付' },
  pending: { color: 'pink', icon: 'clear', text: '已延期' },
  wait: { color: 'cyan', icon: 'comment', text: '待评审' },
};
