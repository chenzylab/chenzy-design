/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md 与 specs/components/other/HotKeys.spec.md §10。
 */
export const meta = {
  name: 'HotKeys',
  category: 'other',
  stage: 'M6',
  semiEquivalent: 'HotKeys',
  description:
    '声明一组键盘快捷键组合并绑定 keydown 监听（默认全局 document.body，可局部），命中触发回调，并渲染语义化 <kbd> 键位提示。修饰键精确匹配 + 普通键用 event.code（物理键位，规避输入法/大小写），mergeMetaCtrl 真正实现跨平台合并 Cmd/Ctrl（Semi 该 prop 未生效）。',
  props: [
    { name: 'hotKeys', type: 'string[]', default: '—', desc: '必填。组合数组，恰含 1 个普通键 + 0~多修饰键；取值用 KeyboardEvent.key 或 HotKeys.Keys.*；非法抛错' },
    { name: 'onHotKey', type: '(e: KeyboardEvent) => void', default: 'undefined', desc: '命中组合时触发，透传原生事件' },
    { name: 'content', type: '(string | Snippet)[]', default: 'undefined', desc: '自定义显示的键名内容（仅影响提示 UI，不改监听），逐项对应' },
    { name: 'render', type: 'Snippet | null', default: 'undefined', desc: '完全自定义提示渲染；传 null 则不渲染提示，仅保留监听' },
    { name: 'preventDefault', type: 'boolean', default: 'false', desc: '命中时是否 event.preventDefault()（拦截浏览器默认行为）' },
    { name: 'mergeMetaCtrl', type: 'boolean', default: 'false', desc: '跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键（本库真正实现，Semi 未生效）' },
    { name: 'getListenerTarget', type: '() => HTMLElement | null', default: '() => document.body', desc: '监听挂载节点；返回具体元素实现局部监听' },
    { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用监听（不绑定，不触发）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
  ],
  events: [{ name: 'onHotKey', payload: '(e: KeyboardEvent)', desc: '组合命中（preventDefault 后）触发' }],
  staticMembers: [
    { name: 'Keys', desc: '键名常量枚举（Keys.Control / Keys.Meta / Keys.K 等），字母/数字/修饰/符号/方向/功能 F1-F12/编辑/小键盘' },
  ],
  slots: [{ name: 'render', desc: '自定义整个提示 UI（等价 render prop）' }],
  i18nKeys: ['HotKeys.ctrl', 'HotKeys.meta', 'HotKeys.alt', 'HotKeys.shift'],
  a11yPattern: 'keyboard-shortcut-hint',
  a11y: {
    keyboard: ['全局/局部 keydown 监听，命中组合触发回调'],
    notes: [
      '每个键位用语义化 <kbd> 承载（超越 Semi 的 span），屏幕阅读器识别为键盘输入',
      '`+` 分隔符 aria-hidden="true"',
      '提示容器 aria-keyshortcuts 声明快捷键（W3C 语法：Control+K）',
      '匹配用 event.code 物理键位，规避输入法/大小写/Shift',
      '键位文本可选中（不设 user-select:none，允许复制）',
      '对比度：键位块文字/背景 ≥4.5:1；RTL：从逻辑起始排列',
      '提示纯展示无焦点；监听不引入焦点陷阱',
    ],
  },
  tokens: [
    '--cd-hotkeys-content-bg',
    '--cd-hotkeys-content-border',
    '--cd-hotkeys-content-color',
    '--cd-hotkeys-content-radius',
    '--cd-hotkeys-content-font-size',
    '--cd-hotkeys-content-padding',
    '--cd-hotkeys-split-color',
    '--cd-hotkeys-gap',
  ],
  examples: [
    { title: '基础 Ctrl+Shift+A', code: '<HotKeys hotKeys={[HotKeys.Keys.Control, HotKeys.Keys.Shift, HotKeys.Keys.A]} onHotKey={() => open()} />' },
    { title: '自定义显示内容', code: '<HotKeys hotKeys={["Control", "K"]} content={["Ctrl", "K"]} onHotKey={search} />' },
    { title: 'render 自定义', code: '<HotKeys hotKeys={["Meta", "S"]} onHotKey={save}>{#snippet render()}<span>⌘S 保存</span>{/snippet}</HotKeys>' },
    { title: 'preventDefault 拦截 Ctrl+S', code: '<HotKeys hotKeys={["Control", "S"]} preventDefault onHotKey={save} />' },
    { title: 'getListenerTarget 局部监听', code: '<HotKeys hotKeys={["Enter"]} getListenerTarget={() => panelEl} onHotKey={submit} />' },
    { title: 'mergeMetaCtrl 跨平台', code: '<HotKeys hotKeys={["Control", "K"]} mergeMetaCtrl onHotKey={cmd} />' },
    { title: '仅监听不显示提示', code: '<HotKeys hotKeys={["Escape"]} render={null} onHotKey={close} />' },
  ],
  doNot: [
    '不要用非 kbd 元素展示键位（丢屏幕阅读器语义）',
    '不要漏 preventDefault 导致浏览器默认行为（如 Ctrl+S 触发保存网页）',
    '不要在 hotKeys 放多个普通键（校验会抛错）',
  ],
} as const;
