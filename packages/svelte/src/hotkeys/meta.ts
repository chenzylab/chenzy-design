/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md 与 specs/components/other/HotKeys.spec.md §10。
 */
export const meta = {
  name: 'HotKeys',
  category: 'plus',
  stage: 'M6',
  semiEquivalent: 'HotKeys',
  description:
    '声明一组键盘快捷键组合并绑定 keydown 监听（默认全局 document.body，可局部），命中触发回调，并渲染键位提示（严格对齐 Semi：div.cd-hotKeys > span > span.-content + span.-split，用 span 非 kbd，键位原样渲染不做大小写/平台符号转换）。修饰键精确匹配 + 普通键用 event.code（物理键位，规避输入法/大小写，Semi 原生设计）。mergeMetaCtrl 为死 prop（严格对齐 Semi：声明但不生效，Meta/Ctrl 仍严格区分）。',
  props: [
    { name: 'hotKeys', type: 'string[]', default: '—', desc: '必填。组合数组，恰含 1 个普通键 + 0~多修饰键；取值用 KeyboardEvent.key 或 HotKeys.Keys.*；非法抛错' },
    { name: 'onHotKey', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '命中组合时触发，透传原生事件' },
    { name: 'content', type: '(string | Snippet)[]', default: 'undefined', desc: '自定义显示的键名内容（仅影响提示 UI，不改监听），整体覆盖默认渲染（对齐 Semi content ?? hotKeys）' },
    { name: 'render', type: 'Snippet | null', default: 'undefined', desc: '完全自定义提示渲染（仍套根节点 div.cd-hotKeys）；传 null 则不渲染提示，仅保留监听' },
    { name: 'onClick', type: '() => void', default: 'undefined', desc: '提示 UI 根节点点击回调（对齐 Semi onClick）' },
    { name: 'preventDefault', type: 'boolean', default: 'false', desc: '命中时是否 event.preventDefault()（拦截浏览器默认行为）' },
    { name: 'mergeMetaCtrl', type: 'boolean', default: 'false', desc: '跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键；死 prop（严格对齐 Semi：声明但不生效）' },
    { name: 'getListenerTarget', type: '() => HTMLElement | null', default: '() => document.body', desc: '监听挂载节点；返回具体元素实现局部监听' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
  ],
  events: [{ name: 'onHotKey', payload: '(e: KeyboardEvent)', desc: '组合命中（preventDefault 后）触发' }],
  staticMembers: [
    { name: 'Keys', desc: '键名常量枚举（Keys.Control / Keys.Meta / Keys.K 等），字母/数字/修饰/符号/方向/功能 F1-F12/编辑/小键盘' },
  ],
  slots: [{ name: 'render', desc: '自定义整个提示 UI（等价 render prop）' }],
  a11yPattern: 'keyboard-shortcut-hint',
  a11y: {
    keyboard: ['全局/局部 keydown 监听，命中组合触发回调'],
    notes: [
      'DOM 严格对齐 Semi：键位用 span（非 kbd）承载，无 aria-keyshortcuts、无 aria-hidden 分隔符',
      '匹配用 event.code 物理键位，规避输入法/大小写/Shift',
      '对比度：键位块文字/背景 ≥4.5:1',
      '提示纯展示无焦点；监听不引入焦点陷阱',
    ],
  },
  tokens: [
    '--cd-color-hotkeys-bg',
    '--cd-color-hotkeys-text',
    '--cd-color-hotkeys-split',
    '--cd-width-hotkeys-border',
    '--cd-radius-hotkeys',
    '--cd-height-hotkeys',
    '--cd-spacing-hotkeys-paddingY',
    '--cd-spacing-hotkeys-paddingX',
  ],
  examples: [
    { title: '基础 Ctrl+Shift+A', code: '<HotKeys hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.Shift, HotKeys.Keys.A]} onHotKey={() => open()} />' },
    { title: '自定义显示内容', code: '<HotKeys hotKeys={["Control", "K"]} content={["Ctrl", "K"]} onHotKey={search} />' },
    { title: 'render 自定义', code: '<HotKeys hotKeys={["Meta", "S"]} onHotKey={save}>{#snippet render()}<span>⌘S 保存</span>{/snippet}</HotKeys>' },
    { title: 'preventDefault 拦截 Ctrl+S', code: '<HotKeys hotKeys={["Control", "S"]} preventDefault onHotKey={save} />' },
    { title: 'getListenerTarget 局部监听', code: '<HotKeys hotKeys={["Enter"]} getListenerTarget={() => panelEl} onHotKey={submit} />' },
    { title: '仅监听不显示提示', code: '<HotKeys hotKeys={["Escape"]} render={null} onHotKey={close} />' },
  ],
  doNot: [
    '不要漏 preventDefault 导致浏览器默认行为（如 Ctrl+S 触发保存网页）',
    '不要在 hotKeys 放多个普通键（校验会抛错）',
  ],
} as const;
