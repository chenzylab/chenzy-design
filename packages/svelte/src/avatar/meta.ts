/**
 * Machine-readable component metadata for AI/docs consumption.
 * Avatar — see specs/components/show/Avatar.spec.md
 */
export const meta = {
  name: 'Avatar',
  category: 'show',
  description:
    '头像：支持图片(src/srcset)、加载失败降级到 children/alt 首字，circle/square 形状，枚举或自定义数字尺寸，color=auto 按文字哈希取色，右下角状态点。Avatar.Group 把多个头像重叠排列，items+maxCount 折叠出「+M」溢出头像，组级 shape/size 透传（子 Avatar 自身 prop 优先）。',
  exports: ['Avatar', 'AvatarGroup'],
  props: [
    { name: 'src', type: 'string', default: 'undefined', desc: '图片地址' },
    { name: 'srcset', type: 'string', default: 'undefined' },
    { name: 'alt', type: 'string', default: 'undefined', desc: 'a11y 文本，也作文字降级来源' },
    { name: 'shape', type: "'circle'|'square'", default: "'circle'" },
    {
      name: 'size',
      type: "'extra-small'|'small'|'default'|'large'|'extra-large'|number",
      default: "'default'",
      desc: '枚举映射 token，number 内联 px',
    },
    {
      name: 'color',
      type: "'auto'|string",
      default: "'grey'",
      desc: 'auto 按文字哈希取预设色；具体色内联背景',
    },
    { name: 'status', type: "'default'|'warning'|'error'", default: "'default'", desc: '状态点色推导' },
    { name: 'dot', type: 'boolean', default: 'false', desc: '右下角状态点' },
    { name: 'dotColor', type: 'string', default: 'undefined', desc: '覆盖状态点颜色' },
    { name: 'gap', type: 'number', default: '3', desc: '文字头像左右内距(px)' },
    { name: 'href', type: 'string', default: 'undefined', desc: '可交互：跳转链接，根渲染为 <a>' },
    { name: 'target', type: 'string', default: 'undefined', desc: '链接 target（仅 href 生效）' },
    {
      name: 'onClick',
      type: '(e: MouseEvent|KeyboardEvent) => void',
      default: 'undefined',
      desc: '可交互：点击回调；无 href 时根取 role=button + 键盘 Enter/Space 激活',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '文字/图标内容' },
  ],
  events: [{ name: 'click', desc: '可交互头像（href/onClick）被点击或键盘激活' }],
  slots: [{ name: 'children', desc: '文字或图标降级内容' }],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '图片头像用 <img alt>；纯文字头像 role=img + aria-label(alt 或文字)。可交互：href→<a>，仅 onClick→role=button + tabindex=0 + 键盘 Enter/Space；纯展示头像不可聚焦。',
  },
  tokens: [
    '--cd-avatar-size-extra-small',
    '--cd-avatar-size-small',
    '--cd-avatar-size-default',
    '--cd-avatar-size-large',
    '--cd-avatar-size-extra-large',
    '--cd-avatar-bg',
    '--cd-avatar-color',
    '--cd-avatar-radius',
  ],
  responsive: false,
  examples: [
    { title: '图片', code: '<Avatar src="/u.png" alt="用户" />' },
    { title: '文字', code: '<Avatar color="auto" alt="陈" />' },
    { title: '状态点', code: '<Avatar alt="A" dot status="error" />' },
    {
      title: '头像组折叠',
      code: '<Avatar.Group maxCount={3} items={[{content:"陈"},{content:"李"},{content:"王"},{content:"赵"}]} />',
    },
    {
      title: '头像组自定义',
      code: '<Avatar.Group size="small"><Avatar>陈</Avatar><Avatar color="auto" alt="李" /></Avatar.Group>',
    },
  ],
} as const;
